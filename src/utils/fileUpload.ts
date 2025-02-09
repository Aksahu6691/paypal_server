import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void {
        if (file.mimetype === 'application/pdf') {
            cb(null, 'public/pdf');
        } else if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png'
        ) {
            cb(null, 'public/images');
        } else {
            cb(null, 'public/otherFiles');
        }
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

export const upload = multer({
    storage: storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
        if (
            file.mimetype.startsWith('image/') &&
            (file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/jpg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'application/pdf')
        ) {
            cb(null, true);
        } else {
            if (file.mimetype.startsWith('image/')) {
                cb(new Error('Only jpg, jpeg, and png images or PDFs are allowed'));
            } else {
                cb(null, true);
            }
        }
    },
});