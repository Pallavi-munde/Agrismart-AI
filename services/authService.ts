
/**
 * Mock Email OTP Service for AgriSmart AI
 */

interface MockSession {
  code: string;
  expiry: number;
}

const sessions = new Map<string, MockSession>();

export async function sendEmailOtp(email: string): Promise<boolean> {
  console.debug(`[AuthService] Initiating Email OTP sequence for ${email}`);
  
  // Simulate SMTP latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + (10 * 60 * 1000); // 10 minute expiry for email
  
  sessions.set(email, { code, expiry });
  
  // Mock Gmail Delivery
  alert(`
    [NEW GMAIL MESSAGE]
    From: AgriSmart Security <noreply@agrismart.ai>
    Subject: Your Verification Code: ${code}
    
    Hi Farmer, 
    Use the following code to authorize your device: ${code}
    This code expires in 10 minutes.
  `);
  
  console.log(`[Mock SMTP] TO: ${email} | CODE: ${code}`);
  
  return true;
}

export async function verifyEmailOtp(email: string, inputCode: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const session = sessions.get(email);
  
  if (!session) return false;
  if (Date.now() > session.expiry) {
    sessions.delete(email);
    return false;
  }
  
  const isValid = session.code === inputCode;
  if (isValid) {
    sessions.delete(email);
  }
  
  return isValid;
}
