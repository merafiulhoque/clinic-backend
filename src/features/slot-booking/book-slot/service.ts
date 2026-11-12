import { BookSlotData } from "../schemas.js";
import { bookSlot } from "../slotsRepo.js";

export const bookSlotService = async (
    data: BookSlotData
) => {
    return await bookSlot(data)
}