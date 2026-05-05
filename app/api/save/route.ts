import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Advanced Engine-Grade Save System API
 * 
 * Implements:
 * - Atomic Writes (Temp file + Rename)
 * - Corruption Detection (Lock files)
 * - Backup Rotation
 * - Profile-based Directory Structure
 */

const getSavePaths = () => {
  const baseDir = process.env.LOCALAPPDATA || 
    (process.platform === 'darwin' 
      ? path.join(process.env.HOME || '', 'Library', 'Application Support') 
      : path.join(process.env.HOME || '', '.local', 'share'));
  
  // Professional Structure: QCH/SaveSystem/profiles/default
  const profileDir = path.join(baseDir, 'QCH', 'SaveSystem', 'profiles', 'default');
  const systemDir = path.join(baseDir, 'QCH', 'SaveSystem'); // For the lock file
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }
  
  return {
    profileDir,
    autoSave: path.join(profileDir, 'auto-save.json'),
    backup: path.join(profileDir, 'backup-save.json'),
    temp: path.join(profileDir, 'auto-save.tmp'),
    lock: path.join(systemDir, 'lock.tmp')
  };
};

export async function POST(request: NextRequest) {
  const paths = getSavePaths();
  
  try {
    const data = await request.json();

    // 1. Create Lock File (Indicates save in progress)
    fs.writeFileSync(paths.lock, 'LOCKED', 'utf-8');

    // 2. Write to Temporary File
    fs.writeFileSync(paths.temp, JSON.stringify(data, null, 2), 'utf-8');

    // 3. Rotate Backup (If current save exists, make it the backup)
    if (fs.existsSync(paths.autoSave)) {
      fs.copyFileSync(paths.autoSave, paths.backup);
    }

    // 4. Atomic Swap (Rename temp to actual)
    // This is the most critical step - either it works or the old file remains intact.
    fs.renameSync(paths.temp, paths.autoSave);

    // 5. Release Lock
    if (fs.existsSync(paths.lock)) {
      fs.unlinkSync(paths.lock);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Advanced Save Error:', error);
    
    // Log to crash log if possible
    try {
      const logDir = path.join(path.dirname(paths.profileDir), '..', 'Logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(path.join(logDir, 'crash.log'), `[${new Date().toISOString()}] SAVE_CRASH: ${error.message}\n`);
    } catch(e) {}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const paths = getSavePaths();
  
  try {
    // 1. Check for Corruption (Lock file existence)
    if (fs.existsSync(paths.lock)) {
      console.warn('SaveSystem: Lock detected! Possible corruption in progress. Restoring backup...');
      if (fs.existsSync(paths.backup)) {
        fs.copyFileSync(paths.backup, paths.autoSave);
        // Clean up lock after restoration
        fs.unlinkSync(paths.lock);
      }
    }

    // 2. Load the Save
    if (!fs.existsSync(paths.autoSave)) {
      return NextResponse.json({ success: false, message: 'No save found' }, { status: 404 });
    }

    const data = fs.readFileSync(paths.autoSave, 'utf-8');
    return NextResponse.json({ success: true, data: JSON.parse(data) });
  } catch (error: any) {
    console.error('Advanced Load Error:', error);
    
    // Final Attempt: Try to load backup if main fails
    try {
       if (fs.existsSync(paths.backup)) {
         const data = fs.readFileSync(paths.backup, 'utf-8');
         return NextResponse.json({ success: true, data: JSON.parse(data), restoredFromBackup: true });
       }
    } catch(e) {}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const paths = getSavePaths();
  
  try {
    const filesToRemove = [paths.autoSave, paths.backup, paths.temp, paths.lock];
    
    filesToRemove.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    return NextResponse.json({ success: true, message: 'All save data cleared' });
  } catch (error: any) {
    console.error('Advanced Delete Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
