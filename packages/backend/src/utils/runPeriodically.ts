/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Runs a function periodically at a given interval.
 * Based on: https://github.com/backstage/backstage/blob/master/plugins/kubernetes-backend/src/service/runPeriodically.ts
 */
export function runPeriodically(
  fn: () => Promise<void>,
  intervalMs: number,
): void {
  let cancel = false;

  const runOnce = async () => {
    if (cancel) {
      return;
    }
    try {
      await fn();
    } catch (error) {
      console.error('Periodic task failed', error);
    }
    setTimeout(runOnce, intervalMs);
  };

  // Start immediately
  runOnce();
}
