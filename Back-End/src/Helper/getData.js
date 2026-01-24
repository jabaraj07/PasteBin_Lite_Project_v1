import Paste from "../model/pasteSchema.js";

export const getPasteData = async (id) => {
    const data = await Paste.findOne({id});
    return data;
}