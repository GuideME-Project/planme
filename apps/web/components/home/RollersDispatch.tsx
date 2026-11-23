"use client";

import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { rollersDispatch } from "./home-content";
import { homeMediaUrl } from "./home-media";
import styles from "./rollers-dispatch.module.css";

type DispatchItem = (typeof rollersDispatch)[number];

export function dispatchImage(id: number) {
  return homeMediaUrl(`rollers-dispatch-2611-${id}.jpg`);
}

/** English pages open the /en/ product link when one exists; only affiliate links are marked sponsored. */
export function dispatchLink(item: DispatchItem, locale: string) {
  const href = locale === "ko" ? item.href : item.hrefEn ?? item.href;
  return { href, rel: href.includes(".tpx.lt/") ? "sponsored noopener noreferrer" : undefined };
}

/** Same 20-photo layout as the GuideME app home: groups of one large square, two small squares, one tall and one wide photo. */
export function RollersDispatch() {
  const { t, locale } = useLocale();
  const tile = (item: DispatchItem, slot: number) => {
    return (
      <a key={item.id} className={styles.tile} data-slot={slot} target="_parent" {...dispatchLink(item, locale)}>
        <Image unoptimized src={dispatchImage(item.id)} alt={t(item.title)} fill
          sizes={slot ? "(max-width: 599px) 50vw, (max-width: 1023px) 25vw, 15vw" : "(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw"} />
        {item.id === rollersDispatch.length && <span className={styles.more}>{t("더 보기 +")}</span>}
      </a>
    );
  };
  return (
    <div className={styles.grid}>
      {[0, 5, 10, 15].map((start) => {
        const [first, ...rest] = rollersDispatch.slice(start, start + 5);
        return (
          <div key={start} className={styles.group}>
            {tile(first, 0)}
            <div className={styles.lower}>{rest.map((item, index) => tile(item, index + 1))}</div>
          </div>
        );
      })}
    </div>
  );
}
