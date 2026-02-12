/**
 * @file 图片生成 Hook
 * @description 管理图片生成状态，复用凭证池的 API Key Provider
 * @module components/image-gen/useImageGen
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useApiKeyProvider } from "@/hooks/useApiKeyProvider";
import { apiKeyProviderApi } from "@/lib/api/apiKeyProvider";
import type {
  GeneratedImage,
  ImageGenRequest,
  ImageGenResponse,
  ImageGenModel,
} from "./types";
import { IMAGE_GEN_MODELS, IMAGE_GEN_PROVIDER_IDS } from "./types";

const HISTORY_KEY = "image-gen-history";

interface GenerateImageOptions {
  imageCount?: number;
  referenceImages?: string[];
  size?: string;
}

interface EndpointAttemptResult {
  imageUrl: string | null;
  error: string | null;
  assistantText?: string | null;
}

interface EndpointRequestOptions {
  timeoutMs?: number;
}

const IMAGE_REQUEST_TIMEOUT_MS = 180_000;

function buildProviderEndpoint(apiHost: string, endpointPath: string): string {
  const trimmedHost = (apiHost || "").trim().replace(/\/+$/, "");
  const normalizedPath = endpointPath.startsWith("/")
    ? endpointPath
    : `/${endpointPath}`;

  if (/\/v\d+$/i.test(trimmedHost) && /^\/v\d+\//i.test(normalizedPath)) {
    return `${trimmedHost}${normalizedPath.replace(/^\/v\d+/i, "")}`;
  }

  return `${trimmedHost}${normalizedPath}`;
}

function wrapBase64AsDataUrl(value: string): string {
  if (value.startsWith("data:image/")) {
    return value;
  }
  return `data:image/png;base64,${value}`;
}

function looksLikeBase64Data(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length < 128) {
    return false;
  }
  return /^[A-Za-z0-9+/=\n\r]+$/.test(normalized);
}

function normalizeImageUrl(endpoint: string, candidate: string): string {
  const value = candidate.trim();

  if (!value) {
    return value;
  }

  if (value.startsWith("data:image/")) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (looksLikeBase64Data(value)) {
    return wrapBase64AsDataUrl(value.replace(/\s+/g, ""));
  }

  try {
    const endpointUrl = new URL(endpoint);

    if (value.startsWith("//")) {
      return `${endpointUrl.protocol}${value}`;
    }

    if (value.startsWith("/")) {
      return `${endpointUrl.origin}${value}`;
    }

    if (value.startsWith("images/") || value.startsWith("v1/")) {
      return `${endpointUrl.origin}/${value.replace(/^\/+/, "")}`;
    }
  } catch {
    return value;
  }

  return value;
}

function previewResponseText(text: string, maxLength = 600): string {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function tryParseJson(text: string): unknown | null {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stripCodeFence(content: string): string {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```$/);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }
  return trimmed;
}

function looksLikeRelativeImagePath(value: string): boolean {
  return (
    /^\/?[^\s"'`<>]+\.(png|jpe?g|gif|webp|bmp|svg)(\?[^\s"'`<>]*)?$/i.test(
      value,
    ) || /^\/?(v\d+\/)?(images?|files?|uploads?)\/[^\s"'`<>]+$/i.test(value)
  );
}

function extractDirectImageCandidate(value: string): string | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:image/")
  ) {
    return normalized;
  }

  if (looksLikeBase64Data(normalized)) {
    return wrapBase64AsDataUrl(normalized.replace(/\s+/g, ""));
  }

  if (looksLikeRelativeImagePath(normalized)) {
    return normalized;
  }

  if (/^\/[^\s]+$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function computeGreatestCommonDivisor(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right !== 0) {
    const temp = right;
    right = left % right;
    left = temp;
  }

  return left || 1;
}

function sizeToAspectRatio(size: string): string | null {
  const matched = size.match(/^(\d+)x(\d+)$/i);
  if (!matched) {
    return null;
  }

  const width = Number.parseInt(matched[1], 10);
  const height = Number.parseInt(matched[2], 10);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const gcd = computeGreatestCommonDivisor(width, height);
  return `${Math.round(width / gcd)}:${Math.round(height / gcd)}`;
}

function collectTextFromUnknown(value: unknown): string[] {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? [text] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextFromUnknown(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const texts: string[] = [];

    if (typeof record.text === "string") {
      texts.push(record.text.trim());
    }

    if (typeof record.content === "string") {
      texts.push(record.content.trim());
    }

    if (record.parts) {
      texts.push(...collectTextFromUnknown(record.parts));
    }

    return texts.filter(Boolean);
  }

  return [];
}

function extractAssistantTextFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  const choicesValue = record.choices;
  if (Array.isArray(choicesValue) && choicesValue.length > 0) {
    const firstChoice = choicesValue[0];
    if (firstChoice && typeof firstChoice === "object") {
      const choiceRecord = firstChoice as Record<string, unknown>;
      const messageValue = choiceRecord.message;
      if (messageValue && typeof messageValue === "object") {
        const messageRecord = messageValue as Record<string, unknown>;
        const contentTexts = collectTextFromUnknown(messageRecord.content);
        if (contentTexts.length > 0) {
          return contentTexts.join("\n");
        }
      }

      const deltaValue = choiceRecord.delta;
      if (deltaValue && typeof deltaValue === "object") {
        const deltaRecord = deltaValue as Record<string, unknown>;
        const deltaTexts = collectTextFromUnknown(deltaRecord.content);
        if (deltaTexts.length > 0) {
          return deltaTexts.join("\n");
        }
      }
    }
  }

  const outputText = record.output_text;
  if (typeof outputText === "string" && outputText.trim().length > 0) {
    return outputText.trim();
  }

  const candidatesValue = record.candidates;
  if (Array.isArray(candidatesValue) && candidatesValue.length > 0) {
    const candidateTexts = collectTextFromUnknown(candidatesValue[0]);
    if (candidateTexts.length > 0) {
      return candidateTexts.join("\n");
    }
  }

  const contentTexts = collectTextFromUnknown(record.content);
  if (contentTexts.length > 0) {
    return contentTexts.join("\n");
  }

  return null;
}

function shouldAutoConfirmChat(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }

  const normalized = stripCodeFence(text);
  return (
    /确认继续|是否继续|要继续吗|你觉得怎么样|是否确认/i.test(normalized) ||
    /不支持.*比例|建议使用.*比例|已支持的比例/i.test(normalized)
  );
}

async function requestImageWithEndpoint(
  endpoint: string,
  payload: Record<string, unknown>,
  apiKey: string,
  logTag: string,
  options?: EndpointRequestOptions,
): Promise<EndpointAttemptResult> {
  const timeoutMs = options?.timeoutMs ?? IMAGE_REQUEST_TIMEOUT_MS;
  const abortController = new AbortController();
  const timeoutHandle =
    timeoutMs > 0
      ? setTimeout(() => {
          abortController.abort();
        }, timeoutMs)
      : null;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
  } catch (error) {
    const rawErrorMessage =
      error instanceof Error ? error.message : String(error);
    const loweredMessage = rawErrorMessage.toLowerCase();
    const isTimeoutLike =
      (error instanceof DOMException && error.name === "AbortError") ||
      loweredMessage.includes("timed out") ||
      loweredMessage.includes("timeout") ||
      loweredMessage.includes("load failed") ||
      loweredMessage.includes("networkerror");

    console.warn(
      `[ImageGen][${logTag}] request failed: endpoint=${endpoint}, timeoutMs=${timeoutMs}, error=${rawErrorMessage}`,
    );

    return {
      imageUrl: null,
      error: isTimeoutLike
        ? `请求超时或网络错误: ${rawErrorMessage}`
        : `请求异常: ${rawErrorMessage}`,
      assistantText: null,
    };
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const parsedJson = tryParseJson(rawText);

  console.log(
    `[ImageGen][${logTag}] endpoint=${endpoint}, status=${response.status}, content-type=${contentType}`,
  );

  if (parsedJson && typeof parsedJson === "object") {
    const parsedRecord = parsedJson as Record<string, unknown>;

    console.log(
      `[ImageGen][${logTag}] response keys:`,
      Object.keys(parsedRecord),
    );

    const choicesValue = parsedRecord.choices;
    if (Array.isArray(choicesValue) && choicesValue.length > 0) {
      const firstChoice = choicesValue[0];
      if (firstChoice && typeof firstChoice === "object") {
        const firstChoiceRecord = firstChoice as Record<string, unknown>;
        const messageValue = firstChoiceRecord.message;
        if (messageValue && typeof messageValue === "object") {
          const messageRecord = messageValue as Record<string, unknown>;
          const contentValue = messageRecord.content;

          if (typeof contentValue === "string") {
            console.log(
              `[ImageGen][${logTag}] first choice content preview:`,
              previewResponseText(contentValue, 300),
            );
          } else if (Array.isArray(contentValue)) {
            const firstItem = contentValue[0];
            const firstItemKeys =
              firstItem && typeof firstItem === "object"
                ? Object.keys(firstItem as Record<string, unknown>)
                : [];

            console.log(
              `[ImageGen][${logTag}] first choice content array: length=${contentValue.length}, firstItemKeys=${firstItemKeys.join(",") || "none"}`,
            );

            if (typeof firstItem === "string") {
              console.log(
                `[ImageGen][${logTag}] first choice first item preview:`,
                previewResponseText(firstItem, 200),
              );
            } else if (firstItem && typeof firstItem === "object") {
              const firstItemText = (firstItem as Record<string, unknown>).text;
              if (typeof firstItemText === "string") {
                console.log(
                  `[ImageGen][${logTag}] first choice first item text preview:`,
                  previewResponseText(firstItemText, 200),
                );
              }
            }
          } else if (contentValue !== undefined) {
            console.log(
              `[ImageGen][${logTag}] first choice content type:`,
              typeof contentValue,
            );
          }
        }
      }
    }

    const outputValue = parsedRecord.output;
    if (Array.isArray(outputValue) && outputValue.length > 0) {
      const firstOutput = outputValue[0];
      if (firstOutput && typeof firstOutput === "object") {
        console.log(
          `[ImageGen][${logTag}] first output keys:`,
          Object.keys(firstOutput as Record<string, unknown>),
        );
      }
    }
  } else {
    console.log(
      `[ImageGen][${logTag}] response preview:`,
      previewResponseText(rawText),
    );
  }

  const assistantText = extractAssistantTextFromPayload(parsedJson);

  if (assistantText) {
    console.log(
      `[ImageGen][${logTag}] assistant text preview:`,
      previewResponseText(stripCodeFence(assistantText), 260),
    );
  }

  if (!response.ok) {
    return {
      imageUrl: null,
      error: `请求失败: ${response.status} - ${previewResponseText(rawText, 300)}`,
      assistantText,
    };
  }

  const imageUrl = parsedJson
    ? extractImageUrlFromPayload(parsedJson)
    : extractImageUrlFromText(rawText);

  if (!imageUrl) {
    return {
      imageUrl: null,
      error: "未能从响应中提取图片",
      assistantText,
    };
  }

  const normalizedImageUrl = normalizeImageUrl(endpoint, imageUrl);

  return {
    imageUrl: normalizedImageUrl,
    error: null,
    assistantText,
  };
}

function extractImageUrlFromText(content: string): string | null {
  if (!content) {
    return null;
  }

  const normalizedContent = stripCodeFence(content);

  const directCandidate = extractDirectImageCandidate(normalizedContent);
  if (directCandidate) {
    return directCandidate;
  }

  const base64MarkdownMatch = normalizedContent.match(
    /!\[.*?\]\((data:image\/[^;]+;base64,[^)]+)\)/,
  );
  if (base64MarkdownMatch) {
    return base64MarkdownMatch[1];
  }

  const markdownMatch = normalizedContent.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownMatch) {
    const markdownValue = markdownMatch[1]
      .trim()
      .replace(/^<|>$/g, "")
      .split(/\s+/)[0];
    const markdownCandidate = extractDirectImageCandidate(markdownValue);
    if (markdownCandidate) {
      return markdownCandidate;
    }
    return markdownValue;
  }

  const dataUriMatch = normalizedContent.match(
    /data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+/,
  );
  if (dataUriMatch) {
    return dataUriMatch[0];
  }

  const plainUrlMatch = normalizedContent.match(/https?:\/\/[^\s"'`<>]+/);
  if (plainUrlMatch) {
    return plainUrlMatch[0];
  }

  const quotedFieldMatch = normalizedContent.match(
    /"(?:url|uri|link|image_url|imageUrl|path|image_path|imagePath|download_url|downloadUrl|file|file_url|fileUrl)"\s*:\s*"([^"]+)"/i,
  );
  if (quotedFieldMatch) {
    const quotedCandidate = extractDirectImageCandidate(quotedFieldMatch[1]);
    if (quotedCandidate) {
      return quotedCandidate;
    }
    return quotedFieldMatch[1];
  }

  const relativePathMatch = normalizedContent.match(
    /(?:^|["'(\s])((?:\/|\.\/)?(?:v\d+\/)?(?:images?|files?|uploads?)\/[^\s"'`<>)]+)(?=$|["')\s])/i,
  );
  if (relativePathMatch) {
    return relativePathMatch[1];
  }

  if (looksLikeBase64Data(normalizedContent)) {
    return wrapBase64AsDataUrl(normalizedContent.replace(/\s+/g, ""));
  }

  const parsed = tryParseJson(normalizedContent);
  if (parsed) {
    return extractImageUrlFromPayload(parsed);
  }

  const jsonBlockMatch = normalizedContent.match(/\{[\s\S]+\}/);
  if (jsonBlockMatch) {
    const nestedParsed = tryParseJson(jsonBlockMatch[0]);
    if (nestedParsed) {
      return extractImageUrlFromPayload(nestedParsed);
    }
  }

  return null;
}

function extractImageUrlFromPayload(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === "string") {
    return extractImageUrlFromText(payload);
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const extracted = extractImageUrlFromPayload(item);
      if (extracted) {
        return extracted;
      }
    }
    return null;
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    const inlineDataValue = record.inline_data || record.inlineData;
    if (inlineDataValue && typeof inlineDataValue === "object") {
      const inlineDataRecord = inlineDataValue as Record<string, unknown>;
      const inlineBase64 = inlineDataRecord.data;
      if (typeof inlineBase64 === "string" && inlineBase64.trim().length > 0) {
        const mime =
          typeof inlineDataRecord.mime_type === "string"
            ? inlineDataRecord.mime_type
            : typeof inlineDataRecord.mimeType === "string"
              ? inlineDataRecord.mimeType
              : "image/png";
        if (inlineBase64.startsWith("data:image/")) {
          return inlineBase64;
        }
        return `data:${mime};base64,${inlineBase64.replace(/\s+/g, "")}`;
      }
    }

    const fileDataValue = record.file_data || record.fileData;
    if (fileDataValue && typeof fileDataValue === "object") {
      const fileDataRecord = fileDataValue as Record<string, unknown>;
      const fileUri = fileDataRecord.file_uri || fileDataRecord.fileUri;
      if (typeof fileUri === "string" && fileUri.trim().length > 0) {
        return fileUri.trim();
      }
    }

    const base64Keys = [
      "b64_json",
      "image_base64",
      "base64",
      "b64",
      "image_b64",
    ];

    for (const key of base64Keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim().length > 0) {
        if (value.startsWith("data:image/")) {
          return value;
        }

        if (
          looksLikeBase64Data(value) ||
          key.includes("b64") ||
          key.includes("base64")
        ) {
          return wrapBase64AsDataUrl(value.replace(/\s+/g, ""));
        }
      }
    }

    const directKeys = [
      "url",
      "uri",
      "link",
      "href",
      "image",
      "image_url",
      "imageUrl",
      "image_uri",
      "imageUri",
      "path",
      "image_path",
      "imagePath",
      "download_url",
      "downloadUrl",
      "file",
      "file_url",
      "fileUrl",
    ];

    for (const key of directKeys) {
      const value = record[key];
      if (typeof value === "string") {
        const directCandidate = extractDirectImageCandidate(value);
        if (directCandidate) {
          return directCandidate;
        }

        const extractedFromText = extractImageUrlFromText(value);
        if (extractedFromText) {
          return extractedFromText;
        }
      }

      if (value && typeof value === "object") {
        const nestedCandidate = extractImageUrlFromPayload(value);
        if (nestedCandidate) {
          return nestedCandidate;
        }
      }
    }

    const directUrl = record.url;
    if (typeof directUrl === "string") {
      return directUrl;
    }

    const imageUrl = record.image_url;
    if (typeof imageUrl === "string") {
      return imageUrl;
    }
    if (imageUrl && typeof imageUrl === "object") {
      const nestedUrl = (imageUrl as Record<string, unknown>).url;
      if (typeof nestedUrl === "string") {
        return nestedUrl;
      }
    }

    const b64Json = record.b64_json;
    if (typeof b64Json === "string" && b64Json.length > 0) {
      return wrapBase64AsDataUrl(b64Json);
    }

    const imageBase64 = record.image_base64;
    if (typeof imageBase64 === "string" && imageBase64.length > 0) {
      return wrapBase64AsDataUrl(imageBase64);
    }

    const base64 = record.base64;
    if (typeof base64 === "string" && base64.length > 0) {
      return wrapBase64AsDataUrl(base64);
    }

    const messageValue = record.message;
    if (messageValue && typeof messageValue === "object") {
      const messageRecord = messageValue as Record<string, unknown>;
      const messageContent = messageRecord.content;

      if (typeof messageContent === "string") {
        const fromMessageText = extractImageUrlFromText(messageContent);
        if (fromMessageText) {
          return fromMessageText;
        }
      }

      if (Array.isArray(messageContent)) {
        for (const item of messageContent) {
          const fromMessageItem = extractImageUrlFromPayload(item);
          if (fromMessageItem) {
            return fromMessageItem;
          }
        }
      }
    }

    const contentValue = record.content;
    if (typeof contentValue === "string") {
      const fromContent = extractImageUrlFromText(contentValue);
      if (fromContent) {
        return fromContent;
      }
    }

    if (Array.isArray(contentValue)) {
      for (const item of contentValue) {
        const fromContentItem = extractImageUrlFromPayload(item);
        if (fromContentItem) {
          return fromContentItem;
        }
      }
    }

    const outputTextValue = record.output_text;
    if (typeof outputTextValue === "string") {
      const fromOutputText = extractImageUrlFromText(outputTextValue);
      if (fromOutputText) {
        return fromOutputText;
      }
    }

    const outputValue = record.output;
    if (Array.isArray(outputValue)) {
      for (const outputItem of outputValue) {
        const fromOutput = extractImageUrlFromPayload(outputItem);
        if (fromOutput) {
          return fromOutput;
        }
      }
    }

    for (const value of Object.values(record)) {
      const extracted = extractImageUrlFromPayload(value);
      if (extracted) {
        return extracted;
      }
    }
  }

  return null;
}

async function requestImageFromNewApi(
  apiHost: string,
  apiKey: string,
  model: string,
  prompt: string,
  referenceImages: string[],
  size: string,
): Promise<string> {
  const referenceText =
    referenceImages.length > 0
      ? `\n参考图链接：\n${referenceImages
          .map((url, index) => `${index + 1}. ${url}`)
          .join("\n")}`
      : "";

  const imagesRequest = {
    model,
    prompt: `${prompt}${referenceText}`,
    n: 1,
    size,
  };

  const imageEndpoint = buildProviderEndpoint(
    apiHost,
    "/v1/images/generations",
  );
  const imageAttempt = await requestImageWithEndpoint(
    imageEndpoint,
    imagesRequest,
    apiKey,
    "new-api/images",
  );

  if (imageAttempt.imageUrl) {
    return imageAttempt.imageUrl;
  }

  console.warn(
    `[ImageGen][new-api/images] failed, fallback to chat: ${imageAttempt.error || "unknown"}`,
  );

  const chatRequest = {
    model,
    messages: [
      {
        role: "user",
        content:
          "请根据以下描述生成一张图片，并以 Markdown 图片格式返回结果。" +
          "\n要求：不要询问是否继续，不要额外解释。若比例不支持，请自动选择最接近的支持比例并直接生成。" +
          (() => {
            const preferredAspectRatio = sizeToAspectRatio(size);
            return preferredAspectRatio
              ? `\n目标分辨率：${size}（优先比例 ${preferredAspectRatio}）`
              : `\n目标分辨率：${size}`;
          })() +
          `\n描述：${prompt}${referenceText}`,
      },
    ],
    temperature: 0.7,
    stream: false,
  };

  const chatEndpoint = buildProviderEndpoint(apiHost, "/v1/chat/completions");
  const chatAttempt = await requestImageWithEndpoint(
    chatEndpoint,
    chatRequest,
    apiKey,
    "new-api/chat",
  );

  if (chatAttempt.imageUrl) {
    return chatAttempt.imageUrl;
  }

  console.warn(
    `[ImageGen][new-api/chat] failed, continue fallback: ${chatAttempt.error || "unknown"}`,
  );

  let chatRetryAttempt: EndpointAttemptResult | null = null;
  if (shouldAutoConfirmChat(chatAttempt.assistantText)) {
    const preferredAspectRatio = sizeToAspectRatio(size);
    const retryMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [
      {
        role: "user",
        content:
          "请直接生成图片，不要询问确认。" +
          (preferredAspectRatio
            ? `\n可优先使用比例：${preferredAspectRatio}`
            : "\n可优先使用最接近可用比例") +
          `\n描述：${prompt}${referenceText}`,
      },
    ];

    if (chatAttempt.assistantText) {
      retryMessages.push({
        role: "assistant",
        content: stripCodeFence(chatAttempt.assistantText),
      });
    }

    retryMessages.push({
      role: "user",
      content:
        "确认继续。请按你建议的可用比例立即生成图片。" +
        "\n只返回 Markdown 图片，不要任何额外文字。",
    });

    chatRetryAttempt = await requestImageWithEndpoint(
      chatEndpoint,
      {
        model,
        messages: retryMessages,
        temperature: 0.7,
        stream: false,
      },
      apiKey,
      "new-api/chat-retry",
    );

    if (chatRetryAttempt.imageUrl) {
      return chatRetryAttempt.imageUrl;
    }

    console.warn(
      `[ImageGen][new-api/chat-retry] failed, fallback to responses: ${chatRetryAttempt.error || "unknown"}`,
    );
  }

  const responsesRequest = {
    model,
    input: `请根据以下描述生成一张图片，仅返回图片结果。\n描述：${prompt}${referenceText}`,
    tools: [{ type: "image_generation" }],
    size,
  };

  const responsesEndpoint = buildProviderEndpoint(apiHost, "/v1/responses");
  const responsesAttempt = await requestImageWithEndpoint(
    responsesEndpoint,
    responsesRequest,
    apiKey,
    "new-api/responses",
  );

  if (responsesAttempt.imageUrl) {
    return responsesAttempt.imageUrl;
  }

  console.warn(
    `[ImageGen][new-api/responses] failed, fallback to gemini-native: ${responsesAttempt.error || "unknown"}`,
  );

  const geminiNativeRequest = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "请根据以下描述生成图片，仅返回图片数据。" +
              (() => {
                const preferredAspectRatio = sizeToAspectRatio(size);
                return preferredAspectRatio
                  ? `\n优先比例：${preferredAspectRatio}`
                  : "";
              })() +
              `\n描述：${prompt}${referenceText}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  };

  const geminiNativeEndpoint = buildProviderEndpoint(
    apiHost,
    `/v1beta/models/${model}:generateContent`,
  );

  const geminiNativeAttempt = await requestImageWithEndpoint(
    geminiNativeEndpoint,
    geminiNativeRequest,
    apiKey,
    "new-api/gemini-native",
  );

  if (geminiNativeAttempt.imageUrl) {
    return geminiNativeAttempt.imageUrl;
  }

  throw new Error(
    `未能从响应中提取图片，请检查服务商返回格式（images: ${imageAttempt.error || "未知"}; chat: ${chatAttempt.error || "未知"}; chat-retry: ${chatRetryAttempt?.error || "未触发"}; responses: ${responsesAttempt.error || "未知"}; gemini-native: ${geminiNativeAttempt.error || "未知"}）`,
  );
}

/**
 * 检查 Provider 是否支持图片生成
 * 通过 Provider ID 或 type 匹配
 */
function isImageGenProvider(providerId: string, providerType: string): boolean {
  return (
    IMAGE_GEN_PROVIDER_IDS.includes(providerId) ||
    IMAGE_GEN_PROVIDER_IDS.includes(providerType)
  );
}

/**
 * 根据 Provider 获取支持的图片模型
 * 优先使用 Provider 的 custom_models，回退到预设模型
 */
function getModelsForProvider(
  providerId: string,
  providerType: string,
  customModels?: string[],
): ImageGenModel[] {
  // 优先使用 Provider 的自定义模型
  if (customModels && customModels.length > 0) {
    return customModels.map((modelId) => ({
      id: modelId,
      name: modelId,
      supportedSizes: [
        "1024x1024",
        "768x1344",
        "1344x768",
        "1792x1024",
        "1024x1792",
      ],
    }));
  }
  // 回退到预设模型（Provider ID 匹配）
  if (IMAGE_GEN_MODELS[providerId]) {
    return IMAGE_GEN_MODELS[providerId];
  }
  // 回退到预设模型（Provider type 匹配）
  if (IMAGE_GEN_MODELS[providerType]) {
    return IMAGE_GEN_MODELS[providerType];
  }
  return [];
}

export function useImageGen() {
  const { providers, loading: providersLoading } = useApiKeyProvider();

  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // 过滤出支持图片生成、启用且有 API Key 的 Provider
  const availableProviders = useMemo(() => {
    console.log(
      "[useImageGen] 支持图片生成的 Provider IDs:",
      IMAGE_GEN_PROVIDER_IDS,
    );
    console.log(
      "[useImageGen] 所有 Provider:",
      providers.map((p) => ({
        id: p.id,
        type: p.type,
        enabled: p.enabled,
        api_key_count: p.api_key_count,
        isImageGen: isImageGenProvider(p.id, p.type),
      })),
    );

    const filtered = providers.filter(
      (p) =>
        p.enabled && p.api_key_count > 0 && isImageGenProvider(p.id, p.type),
    );

    console.log(
      "[useImageGen] 过滤后的 Provider:",
      filtered.map((p) => p.id),
    );
    return filtered;
  }, [providers]);

  // 从 localStorage 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GeneratedImage[];
        setImages(parsed);
        if (parsed.length > 0) {
          setSelectedImageId(parsed[0].id);
        }
      } catch (e) {
        console.error("加载历史记录失败:", e);
      }
    }
  }, []);

  // 自动选择第一个可用的 Provider
  useEffect(() => {
    if (!selectedProviderId && availableProviders.length > 0) {
      const firstProvider = availableProviders[0];
      setSelectedProviderId(firstProvider.id);
      // 设置默认模型
      const models = getModelsForProvider(
        firstProvider.id,
        firstProvider.type,
        firstProvider.custom_models,
      );
      if (models.length > 0) {
        setSelectedModelId(models[0].id);
      }
    }
  }, [availableProviders, selectedProviderId]);

  // 保存历史记录
  const saveHistory = useCallback((newImages: GeneratedImage[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newImages.slice(0, 50)));
  }, []);

  // 获取当前选中的 Provider
  const selectedProvider = useMemo(() => {
    return availableProviders.find((p) => p.id === selectedProviderId);
  }, [availableProviders, selectedProviderId]);

  // 获取当前 Provider 支持的模型
  const availableModels = useMemo(() => {
    if (!selectedProvider) return [];
    return getModelsForProvider(
      selectedProvider.id,
      selectedProvider.type,
      selectedProvider.custom_models,
    );
  }, [selectedProvider]);

  // 获取当前选中的模型
  const selectedModel = useMemo(() => {
    return availableModels.find((m) => m.id === selectedModelId);
  }, [availableModels, selectedModelId]);

  // 获取当前选中的图片
  const selectedImage = useMemo(() => {
    return images.find((img) => img.id === selectedImageId);
  }, [images, selectedImageId]);

  // 切换 Provider 时更新模型
  const handleProviderChange = useCallback(
    (providerId: string) => {
      setSelectedProviderId(providerId);
      const provider = availableProviders.find((p) => p.id === providerId);
      if (provider) {
        const models = getModelsForProvider(
          provider.id,
          provider.type,
          provider.custom_models,
        );
        if (models.length > 0) {
          setSelectedModelId(models[0].id);
        }
      }
    },
    [availableProviders],
  );

  // 生成图片
  const generateImage = useCallback(
    async (prompt: string, options?: GenerateImageOptions) => {
      if (!selectedProvider) {
        throw new Error("请先在凭证池中配置 API Key Provider");
      }

      const generationCount = Math.max(
        1,
        Math.min(options?.imageCount ?? 1, 8),
      );
      const requestSize = options?.size || selectedSize;
      const referenceImages = options?.referenceImages || [];

      const baseId = Date.now();
      const generationItems: GeneratedImage[] = Array.from(
        { length: generationCount },
        (_, index) => ({
          id: `img-${baseId}-${index}`,
          url: "",
          prompt,
          model: selectedModelId,
          size: requestSize,
          providerId: selectedProvider.id,
          providerName: selectedProvider.name,
          createdAt: baseId + index,
          status: "generating",
        }),
      );

      setImages((prev) => {
        const updated = [...generationItems, ...prev];
        saveHistory(updated);
        return updated;
      });
      setSelectedImageId(generationItems[0]?.id || null);

      setGenerating(true);

      try {
        const isNewApi =
          selectedProvider.id === "new-api" ||
          selectedProvider.type === "new-api" ||
          selectedProvider.type === "NewApi";

        if (isNewApi) {
          for (const item of generationItems) {
            try {
              const apiKey = await apiKeyProviderApi.getNextApiKey(
                selectedProvider.id,
              );
              if (!apiKey) {
                throw new Error(
                  "该 Provider 没有可用的 API Key，请在凭证池中添加",
                );
              }

              const imageUrl = await requestImageFromNewApi(
                selectedProvider.api_host,
                apiKey,
                selectedModelId,
                prompt,
                referenceImages,
                requestSize,
              );

              setImages((prev) => {
                const updated = prev.map((img) =>
                  img.id === item.id
                    ? { ...img, url: imageUrl, status: "complete" as const }
                    : img,
                );
                saveHistory(updated);
                return updated;
              });
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);

              setImages((prev) => {
                const updated = prev.map((img) =>
                  img.id === item.id
                    ? { ...img, status: "error" as const, error: errorMessage }
                    : img,
                );
                saveHistory(updated);
                return updated;
              });
            }
          }
        } else {
          const apiKey = await apiKeyProviderApi.getNextApiKey(
            selectedProvider.id,
          );
          if (!apiKey) {
            throw new Error("该 Provider 没有可用的 API Key，请在凭证池中添加");
          }

          const request: ImageGenRequest = {
            model: selectedModelId,
            prompt,
            n: generationCount,
            size: requestSize,
          };

          const endpoint = buildProviderEndpoint(
            selectedProvider.api_host,
            "/v1/images/generations",
          );

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(request),
          });

          const contentType = response.headers.get("content-type") || "";
          const rawText = await response.text();
          const parsedJson = tryParseJson(rawText);

          console.log(
            `[ImageGen][standard/images] endpoint=${endpoint}, status=${response.status}, content-type=${contentType}`,
          );

          if (parsedJson && typeof parsedJson === "object") {
            console.log(
              "[ImageGen][standard/images] response keys:",
              Object.keys(parsedJson as Record<string, unknown>),
            );
          } else {
            console.log(
              "[ImageGen][standard/images] response preview:",
              previewResponseText(rawText),
            );
          }

          if (!response.ok) {
            throw new Error(
              `请求失败: ${response.status} - ${previewResponseText(rawText, 300)}`,
            );
          }

          const data = (parsedJson || {}) as ImageGenResponse;
          const urls = (data.data || [])
            .map((item) => {
              if (item.url) {
                return item.url;
              }
              if (item.b64_json) {
                return wrapBase64AsDataUrl(item.b64_json);
              }
              return "";
            })
            .filter(Boolean);

          if (urls.length === 0) {
            const fallbackUrl = extractImageUrlFromPayload(
              parsedJson || rawText,
            );
            if (fallbackUrl) {
              urls.push(fallbackUrl);
            }
          }

          if (urls.length === 0) {
            throw new Error("未返回图片 URL（响应中未检测到可解析图片字段）");
          }

          setImages((prev) => {
            const updated = prev.map((img) => {
              const index = generationItems.findIndex(
                (item) => item.id === img.id,
              );

              if (index === -1) return img;

              const imageUrl = urls[index];
              if (imageUrl) {
                return { ...img, url: imageUrl, status: "complete" as const };
              }

              return {
                ...img,
                status: "error" as const,
                error: "服务返回的图片数量少于请求数量",
              };
            });

            saveHistory(updated);
            return updated;
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        setImages((prev) => {
          const updated = prev.map((img) =>
            generationItems.some((item) => item.id === img.id) &&
            img.status === "generating"
              ? { ...img, status: "error" as const, error: errorMessage }
              : img,
          );
          saveHistory(updated);
          return updated;
        });
        throw error;
      } finally {
        setGenerating(false);
      }
    },
    [selectedProvider, selectedModelId, selectedSize, saveHistory],
  );

  // 删除图片
  const deleteImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== id);
        if (selectedImageId === id) {
          setSelectedImageId(updated[0]?.id || null);
        }
        saveHistory(updated);
        return updated;
      });
    },
    [selectedImageId, saveHistory],
  );

  // 新建图片（创建一个新的空白图片项）
  const newImage = useCallback(() => {
    console.log("[useImageGen] newImage 被调用，创建新图片项");
    const imageId = `img-${Date.now()}`;
    const newImg: GeneratedImage = {
      id: imageId,
      url: "",
      prompt: "",
      model: selectedModelId,
      size: selectedSize,
      providerId: selectedProviderId,
      providerName: selectedProvider?.name || "",
      createdAt: Date.now(),
      status: "pending",
    };

    setImages((prev) => {
      const updated = [newImg, ...prev];
      saveHistory(updated);
      return updated;
    });
    setSelectedImageId(imageId);
  }, [
    selectedModelId,
    selectedSize,
    selectedProviderId,
    selectedProvider,
    saveHistory,
  ]);

  return {
    // Provider 相关
    availableProviders,
    selectedProvider,
    selectedProviderId,
    setSelectedProviderId: handleProviderChange,
    providersLoading,

    // 模型相关
    availableModels,
    selectedModel,
    selectedModelId,
    setSelectedModelId,

    // 尺寸相关
    selectedSize,
    setSelectedSize,

    // 图片相关
    images,
    selectedImage,
    selectedImageId,
    setSelectedImageId,
    generating,

    // 操作
    generateImage,
    deleteImage,
    newImage,
  };
}
