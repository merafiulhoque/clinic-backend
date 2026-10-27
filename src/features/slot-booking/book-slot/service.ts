import { BookSlotData } from "../schema.js";
import { bookSlot } from "../slotsRepo.js";

export const bookSlotService = async (
    data: BookSlotData
) => {
    return await bookSlot(data)
}