from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
# import resend 
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize Resend
#resend.api_key = os.getenv('RESEND_API_KEY')

# Supabase Admin Client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

class EmailRequest(BaseModel):
    email: EmailStr

@router.post("/send-reset-email")
async def send_reset_email(request: EmailRequest):
    email = request.email
    
    try:
        print(f"🔄 Generating reset link for: {email}")
        
        # Generate password reset link using Supabase Admin
        response = supabase.auth.admin.generate_link({
            'type': 'recovery',
            'email': email,
            # 'options': {
            #     'redirect_to': f"{os.getenv('FRONTEND_URL')}/update-password"
            # }
        })
        
        # reset_link = response.action_link
        # print(f"✅ Reset link generated")

        print(f"✅ Reset email sent via Supabase")
        
        return {
            "success": True,
            "message": "Password reset link sent successfully!"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send reset email: {str(e)}"
        )
        
        # Send email using Resend
        params = {
            'from': 'CareerAI <onboarding@resend.dev>',
            'to': [email],
            'subject': 'Reset Your Password - CareerAI',
            'html': f'''
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <table role="presentation" style="width: 100%; max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🔐 Reset Your Password</h1>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">Hi there,</p>
                                            
                                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                                                We received a request to reset the password for your <strong>CareerAI</strong> account.
                                            </p>
                                            
                                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #333; line-height: 1.6;">
                                                Click the button below to create a new password:
                                            </p>

                                            <table role="presentation" style="width: 100%;">
                                                <tr>
                                                    <td align="center" style="padding: 10px 0 30px 0;">
                                                        <a href="{reset_link}" style="display: inline-block; padding: 16px 40px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                            Reset Password
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #FF6B6B;">
                                                <tr>
                                                    <td style="padding: 20px;">
                                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;"><strong>Button not working?</strong> Copy and paste this link:</p>
                                                        <p style="margin: 0; word-break: break-all; color: #0066cc; font-size: 13px; font-family: monospace;">{reset_link}</p>
                                                    </td>
                                                </tr>
                                            </table>

                                            <table role="presentation" style="width: 100%; margin-top: 30px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                                                <tr>
                                                    <td style="padding: 20px;">
                                                        <p style="margin: 0; font-size: 14px; color: #856404;">
                                                            <strong>⏰ This link expires in 1 hour</strong> for security reasons.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>

                                            <table role="presentation" style="width: 100%; margin-top: 20px; background-color: #e7f3ff; border-radius: 6px; border-left: 4px solid #0066cc;">
                                                <tr>
                                                    <td style="padding: 15px;">
                                                        <p style="margin: 0; font-size: 13px; color: #004085;">
                                                            <strong>🛡️ Security Tip:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 12px 12px;">
                                            <p style="margin: 0 0 5px 0; font-size: 14px; color: #333; font-weight: 600;">CareerAI Team</p>
                                            <p style="margin: 15px 0 0 0; font-size: 13px; color: #6c757d;">This is an automated message, please do not reply.</p>
                                            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">© 2026 CareerAI. All rights reserved.</p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            '''
        }

        email_response = resend.Emails.send(params)
        
        print(f"✅ Email sent successfully: {email_response}")
        
        return {
            "success": True,
            "message": "Password reset link sent successfully!"
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send reset email: {str(e)}"
        )