import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = "https://provider.example.com/v1";
const lookup = async () => [{ address: "8.8.8.8", family: 4 }];

function providerResponse(status: number) {
  return async () =>
    new Response(
      JSON.stringify({
        id: "chatcmpl-test",
        object: "chat.completion",
        created: 0,
        model: "test-model",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "OK" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
      { status, headers: { "content-type": "application/json" } },
    );
}

test("reports a successful response and elapsed duration", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  const result = await testModelConnection({
    body: { model: "test-model", apiKey: "test-key", baseUrl },
    fetch: providerResponse(200),
    lookup,
  });

  assert.equal(result.data.connected, true);
  assert.equal(typeof result.data.durationMs, "number");
  assert.ok(result.data.durationMs >= 0);
});

test("rejects missing connection settings before contacting a provider", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  for (const body of [
    { model: "", apiKey: "test-key", baseUrl: "https://example.com" },
    { model: "test-model", apiKey: "", baseUrl: "https://example.com" },
    { model: "test-model", apiKey: "test-key", baseUrl: "" },
  ]) {
    const result = await testModelConnection({ body });
    assert.equal(result.data.connected, false);
    assert.equal(result.data.message, "模型型号、API Key 和 API 端点不能为空");
    assert.equal(result.code, "0000");
  }
});

test("rejects a non-HTTP API endpoint", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  const result = await testModelConnection({
    body: {
      model: "test-model",
      apiKey: "test-key",
      baseUrl: "file:///etc/passwd",
    },
  });

  assert.equal(result.data.connected, false);
  assert.equal(result.data.message, "API 端点必须使用 HTTPS 地址");
  assert.equal(result.code, "0000");
});

test("rejects private-network API endpoints", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  const result = await testModelConnection({
    body: {
      model: "test-model",
      apiKey: "test-key",
      baseUrl: "https://127.0.0.1/v1",
    },
    fetch: providerResponse(200),
    lookup: async () => [{ address: "127.0.0.1", family: 4 }],
  });

  assert.equal(result.data.connected, false);
  assert.equal(result.data.message, "API 端点必须使用公网地址");
  assert.equal(result.code, "0000");
});

test("rejects IPv4-mapped IPv6 loopback endpoints", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  const result = await testModelConnection({
    body: { model: "test-model", apiKey: "test-key", baseUrl },
    fetch: providerResponse(200),
    lookup: async () => [{ address: "::ffff:127.0.0.1", family: 6 }],
  });

  assert.equal(result.data.connected, false);
  assert.equal(result.data.message, "API 端点必须使用公网地址");
  assert.equal(result.code, "0000");
});

test("returns a safe failure when the provider rejects the request", async () => {
  const { default: testModelConnection } = await import(
    "./testModelConnection"
  );

  const result = await testModelConnection({
    body: { model: "test-model", apiKey: "secret-key", baseUrl },
    fetch: providerResponse(401),
    lookup,
  });

  assert.equal(result.data.connected, false);
  assert.equal(result.data.message, "模型服务返回错误");
  assert.equal(result.code, "0000");
  assert.equal(JSON.stringify(result).includes("secret-key"), false);
});
