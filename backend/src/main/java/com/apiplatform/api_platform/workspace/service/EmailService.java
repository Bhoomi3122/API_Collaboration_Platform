package com.apiplatform.api_platform.workspace.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvitationEmail(
            String toEmail,
            String workspaceName,
            String inviterName,
            String token,
            String role
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "API Platform");
            helper.setTo(toEmail);
            helper.setSubject("You've been invited to join \"" + workspaceName + "\" on API Platform");

            String acceptUrl = baseUrl + "/invitations/accept?token=" + token;
            String rejectUrl = baseUrl + "/invitations/reject?token=" + token;

            String htmlBody = buildEmailHtml(workspaceName, inviterName, role, acceptUrl, rejectUrl);

            helper.setText(htmlBody, true); // true = isHtml

            mailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send invitation email to: " + toEmail, e);
        }
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
               "      <span style='font-size: 20px; font-weight: 700; color: #24292F;'>API Platform</span>" +
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
