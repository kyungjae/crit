"use client";

const KEY = "crit:device-id";

/** 로그인 없이 기기 단위로 레이팅을 식별하기 위한 익명 ID */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
