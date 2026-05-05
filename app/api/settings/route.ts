import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Player Settings API
 * 
 * Handles player preferences (volume, language, etc.) in Roaming AppData.
 */

const getSettingsPath = () => {
  // Use APPDATA for settings (Roaming - follows the user)
  const baseDir = process.env.APPDATA || 
    (process.platform === 'darwin' 
      ? path.join(process.env.HOME || '', 'Library', 'Application Support') 
      : path.join(process.env.HOME || '', '.config'));
  
  const configDir = path.join(baseDir, 'QCH', 'Config');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  return path.join(configDir, 'settings.json');
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const filePath = getSettingsPath();
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Settings Save Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = getSettingsPath();
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'No settings found' }, { status: 404 });
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ success: true, data: JSON.parse(data) });
  } catch (error: any) {
    console.error('API Settings Load Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
