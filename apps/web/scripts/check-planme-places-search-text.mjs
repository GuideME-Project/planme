import assert from "node:assert/strict";
import { resolveSelectedPlanmePlace } from "../lib/planme-places.ts";

// Offline check of the 100-char searchText fallback; Google responses are stubbed.
// node apps/web/scripts/check-planme-places-search-text.mjs
const placeId = "ChIJk7b1IYZH0i0Rk0I7iR69V6E";
const realFetch = globalThis.fetch;
process.env.PLANME_GOOGLE_MAPS_API_KEY ||= "offline-check";

async function resolveWith(name, formattedAddress) {
  globalThis.fetch = async () => Response.json({
    id: placeId,
    displayName: { text: name },
    formattedAddress,
    types: ["natural_feature"],
    addressComponents: [{ longText: "인도네시아", shortText: "ID", types: ["country", "political"] }],
    location: { latitude: -8.66, longitude: 115.13 },
  });
  try {
    return await resolveSelectedPlanmePlace(placeId, "");
  } finally {
    globalThis.fetch = realFetch;
  }
}

const name = "바뚜 볼롱 해변";
const longAddress = `Jl. Pantai Batu Bolong, ${"Canggu".repeat(20)}`.slice(0, 107 - name.length - 1);
assert.equal(`${longAddress} ${name}`.length, 107);
const fallback = await resolveWith(name, longAddress);
assert.ok(fallback);
assert.equal(fallback.searchText, name);
assert.equal(fallback.formattedAddress, longAddress);
console.log("107자 주소+이름: searchText를 장소 이름으로 대체");

const longName = "가".repeat(101);
assert.equal(await resolveWith(longName, "Bali, Indonesia"), null);
console.log("이름도 100자 초과: null");

const short = await resolveWith(name, "Bali, Indonesia");
assert.equal(short.searchText, `Bali, Indonesia ${name}`);
console.log("100자 이하: 주소+이름 유지");
