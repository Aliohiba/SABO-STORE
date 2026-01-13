import 'dotenv/config';
import { updateStoreSettings, getStoreSettings } from '../db-mongo-extended';
import fs from 'fs';
import path from 'path';

// مسار الصورة التي رفعها المستخدم
const IMAGE_PATH = 'C:/Users/Aohiba/.gemini/antigravity/brain/a7940c9f-2a70-4df9-b0fa-6d1961dfda7f/uploaded_image_1767859661045.png';

async function main() {
    try {
        if (!fs.existsSync(IMAGE_PATH)) {
            console.error('File not found:', IMAGE_PATH);
            process.exit(1);
        }

        console.log('Reading image file...');

        // إعداد مسار الرفع المحلي
        const uploadsDir = path.join(process.cwd(), "client", "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // توليد اسم فريد
        const fileName = `cashback_offer_${Date.now()}.png`;
        const destPath = path.join(uploadsDir, fileName);

        console.log('Copying to local uploads...');
        fs.copyFileSync(IMAGE_PATH, destPath);

        const url = `/uploads/${fileName}`;
        console.log('File copied successfully. URL:', url);

        console.log('Updating store settings...');
        const settings = await getStoreSettings();
        const currentBanners = settings?.banners || [];

        // إضافة الرابط الجديد للقائمة
        const newBanners = [...currentBanners, url];
        await updateStoreSettings({ banners: newBanners });
        console.log('Store settings updated. Total Banners:', newBanners.length);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
