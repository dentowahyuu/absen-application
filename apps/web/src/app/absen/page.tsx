"use client";

import { useState } from "react";
import { AttendanceHeader } from "./(components)/AttendanceHeader";
import { GreetingCard } from "./(components)/GreetingCard";
import { CameraScanner } from "./(components)/CameraScanner";
import { TodayStatusCard, type AttendanceResult } from "./(components)/TodayStatusCard";
import { SuccessOverlay } from "./(components)/SuccessOverlay";

export default function AbsenPage() {
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  function handleSuccess(newResult: AttendanceResult) {
    setResult(newResult);
    setShowOverlay(true);
  }

  return (
    <>
      <AttendanceHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pb-10 pt-24">
        <GreetingCard />
        <CameraScanner onSuccess={handleSuccess} />
        <TodayStatusCard result={result} />
      </main>

      {showOverlay && result && (
        <SuccessOverlay result={result} onDismiss={() => setShowOverlay(false)} />
      )}
    </>
  );
}
