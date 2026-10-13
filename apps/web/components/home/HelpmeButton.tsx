"use client";

import type { MouseEvent } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { openZendeskMessenger } from "@/lib/zendesk-messenger";
import styles from "./home.module.css";

const zendeskWidgetKey = process.env.NEXT_PUBLIC_ZENDESK_WIDGET_KEY?.trim() ?? "";
const HELPME_APP_LINK = "guideme://help-me/intro";

/** Opens HelpME in the Zendesk messenger, or in the GuideME app when the widget key is missing or the widget fails to load. */
export function HelpmeButton() {
  const { locale } = useLocale();
  const ko = locale === "ko";
  const label = zendeskWidgetKey
    ? ko ? "HelpME 상담 열기" : "Open HelpME chat"
    : ko ? "GuideME 앱에서 HelpME 열기" : "Open HelpME in the GuideME app";

  function openHelpme(event: MouseEvent<HTMLAnchorElement>) {
    if (!zendeskWidgetKey) return;
    event.preventDefault();
    openZendeskMessenger(zendeskWidgetKey, locale).catch(() => {
      window.location.href = HELPME_APP_LINK;
    });
  }

  return (
    <a href={HELPME_APP_LINK} onClick={openHelpme} aria-label={label} title="HelpME">
      <span className={styles.helpMark} aria-hidden="true">?</span>
    </a>
  );
}
