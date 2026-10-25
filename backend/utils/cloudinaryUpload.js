
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const uploadBufferToCloudinary = (
    buffer,
    {
        folder,
        resourceType = "auto",
        publicId
    } = {}
) => {
    return new Promise((resolve, reject) => {
        if (!buffer) {
            return reject(new Error("File buffer is required."));
        }

        const options = {
            folder,
            resource_type: resourceType
        };

        if (publicId) {
            options.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

       Readable.from([buffer]).pipe(uploadStream);
    });
};

export default uploadBufferToCloudinary;
