import type { Locale } from "@/lib/i18n/routing";

/** Zendesk messaging Web Widget commands PlanME uses (https://developer.zendesk.com/api-reference/widget-messaging/web/core/). */
type ZendeskMessengerApi = {
  (target: "messenger", command: "open" | "show" | "hide"): void;
  (target: "messenger:set", setting: "locale", locale: string): void;
  (target: "messenger:set", setting: "conversationTags", tags: string[]): void;
  (target: "messenger:on", event: "close", callback: () => void): void;
};

type ZendeskWindow = Window & {
  zE?: ZendeskMessengerApi;
  planmeZendeskPromise?: Promise<void>;
};

// Tags reach Zendesk only when the visitor starts a conversation or sends a message, so they are set before the first open.
const PLANME_CONVERSATION_TAGS = ["planme"];
const ZENDESK_LOCALES: Record<Locale, string> = { ko: "ko", en: "en-US" };
// A stalled snippet request fires neither onload nor onerror, so give up after 10 seconds and fall back to the app link.
const ZENDESK_LOAD_TIMEOUT_MS = 10_000;

/** The snippet replaces window.zE once the widget boots, so callers read it on every command instead of keeping a reference. */
function zendesk(): ZendeskMessengerApi {
  const zE = (window as ZendeskWindow).zE;
  if (typeof zE !== "function") throw new Error("Zendesk messaging API was not initialized");
  return zE;
}

/**
 * Loads the Zendesk messaging snippet once. The default launcher is hidden whenever the messenger closes,
 * so the header "?" button stays the only HelpME entry point.
 */
function loadZendeskMessenger(widgetKey: string): Promise<void> {
  const zendeskWindow = window as ZendeskWindow;
  if (zendeskWindow.planmeZendeskPromise) return zendeskWindow.planmeZendeskPromise;

  const script = document.createElement("script");
  zendeskWindow.planmeZendeskPromise = new Promise<void>((resolve, reject) => {
    script.id = "ze-snippet";
    script.async = true;
    const timeout = window.setTimeout(() => reject(new Error("Zendesk messaging snippet timed out")), ZENDESK_LOAD_TIMEOUT_MS);
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Zendesk messaging snippet failed to load"));
    };
    script.onload = () => {
      window.clearTimeout(timeout);
      try {
        zendesk()("messenger:set", "conversationTags", PLANME_CONVERSATION_TAGS);
        zendesk()("messenger:on", "close", () => zendesk()("messenger", "hide"));
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${encodeURIComponent(widgetKey)}`;
    document.body.append(script);
  }).catch((error: Error) => {
    delete zendeskWindow.planmeZendeskPromise;
    script.remove();
    throw error;
  });

  return zendeskWindow.planmeZendeskPromise;
}

/** Opens the HelpME messenger in the current PlanME language. */
export async function openZendeskMessenger(widgetKey: string, locale: Locale) {
  await loadZendeskMessenger(widgetKey);
  zendesk()("messenger:set", "locale", ZENDESK_LOCALES[locale]);
  zendesk()("messenger", "show");
  zendesk()("messenger", "open");
}
