import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export const dynamic = 'force-dynamic';


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
    fs.renameSync(paths.temp, paths.autoSave);

    // 5. Release Lock
    if (fs.existsSync(paths.lock)) {
      fs.unlinkSync(paths.lock);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Advanced Save Error:', error);
    
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
    if (fs.existsSync(paths.lock)) {
      console.warn('SaveSystem: Lock detected! Restoring backup...');
      if (fs.existsSync(paths.backup)) {
        fs.copyFileSync(paths.backup, paths.autoSave);
        fs.unlinkSync(paths.lock);
      }
    }

    if (!fs.existsSync(paths.autoSave)) {
      return NextResponse.json({ success: false, message: 'No save found' }, { status: 404 });
    }

    const data = fs.readFileSync(paths.autoSave, 'utf-8');
    return NextResponse.json({ success: true, data: JSON.parse(data) }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Advanced Load Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const paths = getSavePaths();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[SaveSystem][${requestId}] --- HARD RESET INITIATED ---`);
    const filesToRemove = [
      { name: 'Auto-Save', path: paths.autoSave },
      { name: 'Backup', path: paths.backup },
      { name: 'Temporary', path: paths.temp },
      { name: 'Lock', path: paths.lock }
    ];
    
    let deletedCount = 0;
    let errorCount = 0;

    filesToRemove.forEach(file => {
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          console.log(`[SaveSystem][${requestId}] SUCCESS: Deleted ${file.name} (${path.basename(file.path)})`);
          deletedCount++;
        } catch (err: any) {
          console.error(`[SaveSystem][${requestId}] ERROR: Failed to delete ${file.name}: ${err.message}`);
          errorCount++;
        }
      } else {
        console.log(`[SaveSystem][${requestId}] SKIP: ${file.name} not found.`);
      }
    });

    // Clean up profile directory
    try {
      if (fs.existsSync(paths.profileDir)) {
        const remaining = fs.readdirSync(paths.profileDir);
        if (remaining.length === 0) {
          fs.rmdirSync(paths.profileDir);
          console.log(`[SaveSystem][${requestId}] SUCCESS: Profile directory removed.`);
        } else {
          console.log(`[SaveSystem][${requestId}] INFO: Profile directory not empty (${remaining.length} files), keeping directory.`);
        }
      }
    } catch (e: any) {
      console.error(`[SaveSystem][${requestId}] ERROR: Directory cleanup failed: ${e.message}`);
    }

    console.log(`[SaveSystem][${requestId}] --- HARD RESET COMPLETE (Deleted: ${deletedCount}, Errors: ${errorCount}) ---`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hard reset complete',
      details: { deleted: deletedCount, errors: errorCount }
    });
  } catch (error: any) {
    console.error(`[SaveSystem][${requestId}] CRITICAL RESET ERROR:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      requestId 
    }, { status: 500 });
  }
}

