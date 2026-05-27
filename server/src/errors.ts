export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function sendError(res: import("express").Response, error: unknown) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ code: error.code, error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({
    code: "internal",
    error: "Something went wrong. Please try again.",
  });
}
