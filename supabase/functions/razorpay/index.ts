import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/razorpay", "");

    if (path === "/create-order" && req.method === "POST") {
      return await handleCreateOrder(req);
    }

    if (path === "/verify-payment" && req.method === "POST") {
      return await handleVerifyPayment(req);
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCreateOrder(req: Request) {
  const body = await req.json();
  const { name, email, phone, position, amount } = body;

  if (!name || !email || !amount) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const orderAmount = amount || 9900; // 99 INR in paise
  const receipt = `rcpt_${Date.now()}`;

  const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
    },
    body: JSON.stringify({
      amount: orderAmount,
      currency: "INR",
      receipt,
      notes: { name, email, phone, position },
    }),
  });

  const orderData = await orderRes.json();

  if (!orderRes.ok) {
    console.error("Razorpay order error:", orderData);
    return new Response(
      JSON.stringify({ error: "Failed to create order", details: orderData }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Save to Supabase
  const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      razorpay_order_id: orderData.id,
      name,
      email,
      phone,
      position,
      amount: orderAmount,
      currency: "INR",
      status: "created",
    }),
  });

  if (!supabaseRes.ok) {
    const err = await supabaseRes.json();
    console.error("Supabase insert error:", err);
  }

  return new Response(
    JSON.stringify({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: RAZORPAY_KEY_ID,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerifyPayment(req: Request) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return new Response(
      JSON.stringify({ error: "Missing payment verification fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify signature
  const encoder = new TextEncoder();
  const message = `${razorpay_order_id}|${razorpay_payment_id}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const expectedSignature = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    // Update payment status to failed
    await updatePaymentStatus(razorpay_order_id, "failed", razorpay_payment_id, razorpay_signature);

    return new Response(
      JSON.stringify({ error: "Invalid signature", verified: false }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update payment status to paid
  await updatePaymentStatus(razorpay_order_id, "paid", razorpay_payment_id, razorpay_signature);

  return new Response(
    JSON.stringify({ verified: true, message: "Payment verified successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updatePaymentStatus(
  orderId: string,
  status: string,
  paymentId: string,
  signature: string
) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/payments?razorpay_order_id=eq.${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        status,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Failed to update payment status:", err);
  }
}
