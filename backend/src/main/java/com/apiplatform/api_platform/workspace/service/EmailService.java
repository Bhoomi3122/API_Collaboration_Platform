package com.apiplatform.api_platform.workspace.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendInvitationEmail(
            String toEmail,
            String workspaceName,
            String inviterName,
            String token,
            String role
    ) {
        logger.info("[EMAIL] Attempting to send invitation email to: {}", toEmail);
        logger.info("[EMAIL] Using sender: {}", senderEmail);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true = multipart (needed to send both plain text + HTML)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "Specify Team");
            helper.setTo(toEmail);
            helper.setReplyTo(senderEmail, "Specify Team");
            // Clean subject — avoid special characters like quotes that trigger spam filters
            helper.setSubject("Invitation to join " + workspaceName + " on Specify");

            String acceptUrl = baseUrl + "/invitations/accept?token=" + token;
            String rejectUrl = baseUrl + "/invitations/reject?token=" + token;

            logger.info("[EMAIL] Accept URL: {}", acceptUrl);

            String plainText = buildEmailPlainText(workspaceName, inviterName, role, acceptUrl, rejectUrl);
            String htmlBody = buildEmailHtml(workspaceName, inviterName, role, acceptUrl, rejectUrl);

            // Send BOTH plain text and HTML — spam filters trust multipart emails more
            helper.setText(plainText, htmlBody);

            mailSender.send(message);

            logger.info("[EMAIL] ✅ Invitation email successfully sent to: {}", toEmail);

        } catch (MailException e) {
            logger.error("[EMAIL] ❌ MailException while sending to {}: {}", toEmail, e.getMessage(), e);
        } catch (MessagingException e) {
            logger.error("[EMAIL] ❌ MessagingException while sending to {}: {}", toEmail, e.getMessage(), e);
        } catch (UnsupportedEncodingException e) {
            logger.error("[EMAIL] ❌ UnsupportedEncodingException while sending to {}: {}", toEmail, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("[EMAIL] ❌ Unexpected error while sending email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildEmailPlainText(
            String workspaceName,
            String inviterName,
            String role,
            String acceptUrl,
            String rejectUrl
    ) {
        return "Hi,\n\n" +
               inviterName + " has invited you to collaborate on the workspace: " + workspaceName + "\n" +
               "Your role: " + role + "\n\n" +
               "Accept the invitation:\n" + acceptUrl + "\n\n" +
               "Decline the invitation:\n" + rejectUrl + "\n\n" +
               "This invitation expires in 7 days.\n\n" +
               "If you did not expect this invitation, you can safely ignore this email.\n\n" +
               "— The Specify Team";
    }

    private String buildEmailHtml(
            String workspaceName,
            String inviterName,
            String role,
            String acceptUrl,
            String rejectUrl
    ) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<body style='font-family: Inter, Arial, sans-serif; background: #F6F8FA; margin: 0; padding: 0;'>" +
               "  <div style='max-width: 480px; margin: 40px auto; background: #FFFFFF; border: 1px solid #D0D7DE;" +
               "              border-radius: 8px; padding: 32px;'>" +

               "    <!-- Logo / Header -->" +
               "    <div style='text-align: center; margin-bottom: 28px;'>" +
               "      <span style='font-size: 20px; font-weight: 700; color: #24292F;'>Specify</span>" +
               "    </div>" +

               "    <!-- Title -->" +
               "    <h2 style='font-size: 18px; font-weight: 600; color: #24292F; margin: 0 0 12px;'>" +
               "      You've been invited!" +
               "    </h2>" +

               "    <!-- Body text -->" +
               "    <p style='font-size: 14px; color: #57606A; line-height: 1.6; margin: 0 0 8px;'>" +
               "      <strong style='color: #24292F;'>" + inviterName + "</strong> has invited you to collaborate" +
               "      on the workspace:" +
               "    </p>" +

               "    <!-- Workspace name box -->" +
               "    <div style='background: #F6F8FA; border: 1px solid #D0D7DE; border-radius: 6px;" +
               "                padding: 12px 16px; margin: 16px 0;'>" +
               "      <span style='font-size: 15px; font-weight: 600; color: #24292F;'>" + workspaceName + "</span>" +
               "      <br/>" +
               "      <span style='font-size: 12px; color: #57606A; margin-top: 4px; display: inline-block;'>" +
               "        Your role: <strong>" + role + "</strong>" +
               "      </span>" +
               "    </div>" +

               "    <p style='font-size: 13px; color: #57606A; margin: 0 0 24px;'>" +
               "      This invitation expires in <strong>7 days</strong>." +
               "    </p>" +

               "    <!-- Action Buttons -->" +
               "    <div style='display: flex; gap: 12px; margin-bottom: 24px;'>" +
               "      <a href='" + acceptUrl + "'" +
               "         style='display: inline-block; padding: 10px 24px; background: #2F81F7; color: #FFFFFF;" +
               "                font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px;" +
               "                margin-right: 12px;'>" +
               "        Accept Invitation" +
               "      </a>" +
               "      <a href='" + rejectUrl + "'" +
               "         style='display: inline-block; padding: 10px 24px; background: #FFFFFF; color: #57606A;" +
               "                font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px;" +
               "                border: 1px solid #D0D7DE;'>" +
               "        Decline" +
               "      </a>" +
               "    </div>" +

               "    <!-- Divider -->" +
               "    <hr style='border: none; border-top: 1px solid #D0D7DE; margin: 24px 0;'/>" +

               "    <!-- Footer -->" +
               "    <p style='font-size: 12px; color: #8C959F; margin: 0;'>" +
               "      If you did not expect this invitation, you can safely ignore this email." +
               "      <br/>This invitation link will expire in 7 days." +
               "    </p>" +

               "  </div>" +
               "</body>" +
               "</html>";
    }
}
