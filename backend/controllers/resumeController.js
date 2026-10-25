
import fs from "fs/promises";
import PDFDocument from "pdfkit";
import Resume from "../models/Resume.js";
import cloudinary from "../config/cloudinary.js";
import uploadBufferToCloudinary from "../utils/cloudinaryUpload.js";

const getUserId = (req) => req.user?.id || req.user?._id;

const removeCloudinaryFile = async (publicId, resourceType) => {
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            type: "upload"
        });
    } catch (error) {
        console.error("Cloudinary cleanup error:", error.message);
    }
};

const removeLocalFile = async (filePath) => {
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Local file cleanup error:", error.message);
        }
    }
};

const fetchCloudinaryFile = async (fileUrl) => {
    const url = new URL(fileUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== "res.cloudinary.com"
    ) {
        throw new Error("Invalid stored Cloudinary URL.");
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to retrieve file from Cloudinary.");
    }

    return Buffer.from(await response.arrayBuffer());
};

const fetchCloudinaryPhoto = async (photoUrl) => {
    const url = new URL(photoUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.includes("/image/upload/")
    ) {
        throw new Error("Invalid Cloudinary photo URL.");
    }

    const jpegUrl = url.href.replace(
        "/image/upload/",
        "/image/upload/f_jpg/"
    );

    const response = await fetch(jpegUrl);

    if (!response.ok) {
        throw new Error(
            `Cloudinary photo request failed: ${response.status}`
        );
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (
        buffer.length < 3 ||
        buffer[0] !== 0xff ||
        buffer[1] !== 0xd8 ||
        buffer[2] !== 0xff
    ) {
        throw new Error("The downloaded photo is not a valid JPEG.");
    }

    return buffer;
};

// GET: Fetch logged-in user's resume
export const getMyResume = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: "Authentication required."
            });
        }

        const resume = await Resume.findOne({ userId }).select(
            "-filePath -filePublicId -photoPublicId"
        );

        return res.status(200).json({
            status: 1,
            data: resume
        });
    } catch (error) {
        console.error("Get resume error:", error);

        return res.status(500).json({
            status: 0,
            message: "Unable to fetch resume."
        });
    }
};

// PUT: Save or edit Resume Builder data and profile photo
export const saveBuilderResume = async (req, res) => {
    let newlyUploadedPhotoId = "";

    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: "Authentication required."
            });
        }

        const {
            personalInfo,
            objective,
            education,
            skills,
            experience,
            projects,
            certifications,
            template,
            photo
        } = req.body;

        if (!personalInfo?.fullName?.trim()) {
            return res.status(400).json({
                status: 0,
                message: "Full name is required."
            });
        }

        const existingResume = await Resume.findOne({ userId });

        let photoUrl = existingResume?.photo || "";
        let photoPublicId = existingResume?.photoPublicId || "";

        // IMPORTANT:
        // An explicit empty string means the user removed the photo.
        // An undefined photo means the request did not include the field.
        if (photo === "") {
            photoUrl = "";
            photoPublicId = "";
        } else if (typeof photo === "string" && photo.startsWith("data:")) {
            const match = photo.match(
                /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/
            );

            if (!match) {
                return res.status(400).json({
                    status: 0,
                    message: "Profile photo must be a JPEG, PNG, or WebP image."
                });
            }

            const imageBuffer = Buffer.from(match[2], "base64");

            if (
                imageBuffer.length === 0 ||
                imageBuffer.length > 5 * 1024 * 1024
            ) {
                return res.status(400).json({
                    status: 0,
                    message: "Profile photo must be 5 MB or smaller."
                });
            }

            const uploadedPhoto = await cloudinary.uploader.upload(photo, {
                folder: "smartcareer/resume-photos",
                resource_type: "image"
            });

            photoUrl = uploadedPhoto.secure_url;
            photoPublicId = uploadedPhoto.public_id;
            newlyUploadedPhotoId = uploadedPhoto.public_id;
        } else if (typeof photo === "string" && photo.trim()) {
            if (
                !photo.startsWith("https://res.cloudinary.com/") ||
                !photo.includes("/image/upload/")
            ) {
                return res.status(400).json({
                    status: 0,
                    message: "Invalid profile photo URL."
                });
            }

            photoUrl = photo;
        }

        const updateData = {
            userId,
            source: "builder",
            personalInfo: {
                fullName: personalInfo.fullName || "",
                email: personalInfo.email || "",
                phone: personalInfo.phone || "",
                address: personalInfo.address || "",
                linkedIn: personalInfo.linkedIn || "",
                portfolio: personalInfo.portfolio || ""
            },
            photo: photoUrl,
            photoPublicId,
            objective: objective || "",
            education: Array.isArray(education) ? education : [],
            skills: Array.isArray(skills) ? skills : [],
            experience: Array.isArray(experience) ? experience : [],
            projects: Array.isArray(projects) ? projects : [],
            certifications: Array.isArray(certifications)
                ? certifications
                : [],
            template: ["classic", "modern"].includes(template)
                ? template
                : "modern"
        };

        let resume;

        try {
            resume = await Resume.findOneAndUpdate(
                { userId },
                { $set: updateData },
                {
                    returnDocument: "after",
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );
        } catch (error) {
            if (newlyUploadedPhotoId) {
                await removeCloudinaryFile(newlyUploadedPhotoId, "image");
                newlyUploadedPhotoId = "";
            }

            throw error;
        }

        // Delete the previous Cloudinary photo only after DB save succeeds.
        if (
            existingResume?.photoPublicId &&
            existingResume.photoPublicId !== photoPublicId
        ) {
            await removeCloudinaryFile(
                existingResume.photoPublicId,
                "image"
            );
        }

        return res.status(200).json({
            status: 1,
            message: "Resume saved successfully.",
            data: resume
        });
    } catch (error) {
        if (newlyUploadedPhotoId) {
            await removeCloudinaryFile(newlyUploadedPhotoId, "image");
        }

        console.error("Save builder resume error:", error);

        return res.status(500).json({
            status: 0,
            message: "Unable to save resume."
        });
    }
};

// POST: Upload or replace a PDF resume using Cloudinary
export const uploadMyResume = async (req, res) => {
    let uploadedPublicId = "";

    try {
        const userId = getUserId(req);
        const file = req.file;

        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: "Authentication required."
            });
        }

        if (!file?.buffer) {
            return res.status(400).json({
                status: 0,
                message: "Please select a PDF resume."
            });
        }

        if (file.buffer.subarray(0, 5).toString() !== "%PDF-") {
            return res.status(400).json({
                status: 400,
                message: "The selected file is not a valid PDF."
            });
        }

        const existingResume = await Resume.findOne({ userId });

        const safeFileName = file.originalname
            .replace(/[\\/]/g, "_")
            .replace(/[^a-zA-Z0-9._ -]/g, "_");

        const uploadResult = await uploadBufferToCloudinary(file.buffer, {
            folder: "smartcareer/resumes",
            resourceType: "raw",
            publicId: `${userId}_${Date.now()}_${safeFileName}`
        });

        uploadedPublicId = uploadResult.public_id;

        let resume;

        try {
            resume = await Resume.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        userId,
                        source: "upload",
                        fileName: safeFileName,
                        filePath: "",
                        fileUrl: uploadResult.secure_url,
                        filePublicId: uploadResult.public_id,
                        fileResourceType: "raw",
                        fileSize: file.size,
                        uploadedAt: new Date()
                    }
                },
                {
                    returnDocument: "after",
                    upsert: true,
                    runValidators: true
                }
            );
        } catch (error) {
            await removeCloudinaryFile(uploadedPublicId, "raw");
            uploadedPublicId = "";
            throw error;
        }

        if (
            existingResume?.filePublicId &&
            existingResume.filePublicId !== uploadResult.public_id
        ) {
            await removeCloudinaryFile(existingResume.filePublicId, "raw");
        }

        if (existingResume?.filePath) {
            await removeLocalFile(existingResume.filePath);
        }

        return res.status(200).json({
            status: 1,
            message: "Resume uploaded successfully.",
            data: {
                _id: resume._id,
                source: resume.source,
                fileName: resume.fileName,
                fileSize: resume.fileSize,
                fileUrl: resume.fileUrl,
                uploadedAt: resume.uploadedAt
            }
        });
    } catch (error) {
        if (uploadedPublicId) {
            await removeCloudinaryFile(uploadedPublicId, "raw");
        }

        console.error("Upload resume error:", error);

        return res.status(500).json({
            status: 0,
            message: "Resume upload failed."
        });
    }
};

// Generate PDF from Resume Builder data
const generateBuilderPDF = async (resume, res) => {
    const doc = new PDFDocument({
        size: "A4",
        margins: {
            top: 45,
            bottom: 45,
            left: 50,
            right: 50
        },
        bufferPages: true
    });

    const filename = `${(resume.personalInfo?.fullName || "Resume")
        .replace(/[^a-z0-9_-]/gi, "_")}_Resume.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
    );

    doc.on("error", (error) => {
        console.error("PDF generation error:", error);
        if (!res.headersSent) res.status(500);
        res.end();
    });

    doc.pipe(res);

    const info = resume.personalInfo || {};

    if (resume.photo?.startsWith("https://res.cloudinary.com/")) {
        try {
            const photoBuffer = await fetchCloudinaryPhoto(resume.photo);

            doc.image(photoBuffer, 465, 45, {
                fit: [80, 80],
                align: "center",
                valign: "center"
            });
        } catch (error) {
            console.error("Resume photo could not be loaded:", error.message);
        }
    }

    doc.font("Helvetica-Bold")
        .fontSize(22)
        .fillColor("#1e1b4b")
        .text(info.fullName || "Your Name", 50, 45, {
            width: 390
        });

    doc.moveDown(0.4);

    const contact = [
        info.email,
        info.phone,
        info.address,
        info.linkedIn,
        info.portfolio
    ].filter(Boolean);

    if (contact.length) {
        doc.font("Helvetica")
            .fontSize(9)
            .fillColor("#555555")
            .text(contact.join(" | "), {
                width: 390
            });
    }

    const heading = (text) => {
        doc.moveDown(0.7);
        doc.font("Helvetica-Bold")
            .fontSize(13)
            .fillColor("#3730a3")
            .text(text.toUpperCase());

        doc.moveDown(0.25);
        doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor("#c7d2fe")
            .stroke();

        doc.moveDown(0.4);
    };

    const textValue = (value) => {
        if (value && String(value).trim()) {
            doc.font("Helvetica")
                .fontSize(10)
                .fillColor("#222222")
                .text(String(value));
        }
    };

    if (resume.objective) {
        heading("Career Objective");
        textValue(resume.objective);
    }

    if (resume.education?.length) {
        heading("Education");

        resume.education.forEach((item) => {
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#222222")
                .text(item.degree || "Education");

            textValue(
                [item.institution, item.year, item.grade]
                    .filter(Boolean)
                    .join(" | ")
            );

            doc.moveDown(0.4);
        });
    }

    if (resume.skills?.length) {
        heading("Skills");
        textValue(resume.skills.join(", "));
    }

    if (resume.experience?.length) {
        heading("Experience");

        resume.experience.forEach((item) => {
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#222222")
                .text(item.position || "Position");

            textValue(
                [item.company, item.duration]
                    .filter(Boolean)
                    .join(" | ")
            );

            textValue(item.description);
            doc.moveDown(0.4);
        });
    }

    if (resume.projects?.length) {
        heading("Projects");

        resume.projects.forEach((item) => {
            doc.font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("#222222")
                .text(item.title || "Project");

            textValue(item.technologies);
            textValue(item.description);
            textValue(item.projectUrl);
            doc.moveDown(0.4);
        });
    }

    if (resume.certifications?.length) {
        heading("Certifications");
        resume.certifications.forEach(textValue);
    }

    doc.end();
};

// GET: Download uploaded PDF or generate Builder PDF
export const downloadMyResume = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: "Authentication required."
            });
        }

        const resume = await Resume.findOne({ userId });

        if (!resume) {
            return res.status(404).json({
                status: 0,
                message: "No resume found. Please create or upload one."
            });
        }

        if (resume.source === "builder") {
            await generateBuilderPDF(resume, res);
            return;
        }

        if (resume.fileUrl && resume.filePublicId) {
            const pdfBuffer = await fetchCloudinaryFile(resume.fileUrl);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${(resume.fileName || "Resume.pdf")
                    .replace(/["\r\n]/g, "_")}"`
            );

            return res.status(200).send(pdfBuffer);
        }

        // Backward compatibility for existing locally stored PDFs.
        if (resume.filePath) {
            await fs.access(resume.filePath);
            return res.download(resume.filePath, resume.fileName);
        }

        return res.status(404).json({
            status: 0,
            message: "No uploaded PDF found. Please upload a resume again."
        });
    } catch (error) {
        console.error("Download resume error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                status: 0,
                message: "Unable to download resume."
            });
        }

        res.end();
    }
};

// DELETE: Remove resume record and associated files
export const deleteMyResume = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                status: 0,
                message: "Authentication required."
            });
        }

        const resume = await Resume.findOne({ userId });

        if (!resume) {
            return res.status(404).json({
                status: 0,
                message: "No resume found."
            });
        }

        await Resume.deleteOne({ _id: resume._id });

        if (resume.filePublicId) {
            await removeCloudinaryFile(resume.filePublicId, "raw");
        }

        if (resume.photoPublicId) {
            await removeCloudinaryFile(resume.photoPublicId, "image");
        }

        if (resume.filePath) {
            await removeLocalFile(resume.filePath);
        }

        return res.status(200).json({
            status: 1,
            message: "Resume deleted successfully."
        });
    } catch (error) {
        console.error("Delete resume error:", error);

        return res.status(500).json({
            status: 0,
            message: "Unable to delete resume."
        });
    }
};
