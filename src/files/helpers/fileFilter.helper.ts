export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error("file is empty"), false)
    const fileExptension = file.mimetype.split("/")[1];
    const validExtencion = ['jpg', 'jpeg', 'png', 'gif']
    if (validExtencion.includes(fileExptension)) {
        callback(null, true);
    }
    callback(null, false);
}