import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export const dynamic = 'force-dynamic';


/**
 * Advanced Logging API
 * 
 * Supports:
 * - session.log (Regular events)
 * - crash.log (Errors and critical failures)
 */

const getLogPaths = () => {
  const baseDir = process.env.LOCALAPPDATA || 
    (process.platform === 'darwin' 
      ? path.join(process.env.HOME || '', 'Library', 'Application Support') 
      : path.join(process.env.HOME || '', '.local', 'share'));
  
  const logDir = path.join(baseDir, 'QCH', 'Logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  return {
    session: path.join(logDir, 'session.log'),
    crash: path.join(logDir, 'crash.log')
  };
};

export async function POST(request: NextRequest) {
  try {
    const { event, details, playerName, isCrash } = await request.json();
    const paths = getLogPaths();
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [Player: ${playerName || 'Unknown'}] EVENT: ${event} | DETAILS: ${JSON.stringify(details)}\n`;
    
    // Write to the appropriate file
    const targetFile = isCrash ? paths.crash : paths.session;
    fs.appendFileSync(targetFile, logEntry, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Log Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
