import { useEffect } from "react";
import { assertRtkQueryError } from "../misc";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export function useAssertRtkError(error: FetchBaseQueryError | SerializedError | undefined) {
  useEffect(() => assertRtkQueryError(error), [error]);
}
