import { configDotenv } from "dotenv"
import { AppError } from "shared/utilities/errorHandler.js";
configDotenv({
  quiet: true,
  debug: false
})

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

const WP_API_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWpMessage =async (
  phone: string,
  message: string
) => {
  if (!WHATSAPP_API_VERSION ||
    !WHATSAPP_PHONE_NUMBER_ID ||
    !WHATSAPP_ACCESS_TOKEN
  ) throw new AppError(500, "Internal server error")

  const response = await fetch(
    WP_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {body: message}
      })
    }
  )

  return await response.json()
}
