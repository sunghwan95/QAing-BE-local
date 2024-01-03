import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      auth: {
        user: 'contact@qaing.co',
        pass: 'qaing1234!',
      },
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const mailOptions = {
      from: '"QAing (큐에잉)" <contact@qaing.co>',
      to: userEmail,
      subject: `[QAing] 안녕하세요 ${userName}님, 만나서 반가워요 🙌`,
      html: `<!DOCTYPE html><html><head><meta content="width=device-width,initial-scale=1,maximum-scale=1" name="viewport"><meta charset="UTF-8"></head><body style="width:100%;margin:0"><div class="stb-container-full" style="width:100%;padding:40px 0;margin:0 auto;display:block"><table class="stb-container stb-option-normal" cellpadding="0" cellspacing="0" border="NaN" bordercolor align="center" style="margin:0 auto;width:94%;max-width:630px;background:#fff;border-style:none;box-sizing:border-box"><tbody><tr style="margin:0;padding:0"><td style="width:100%;max-width:630px;margin:0 auto;position:relative;border-spacing:0;border:0;clear:both;border-collapse:separate;padding:0;overflow:hidden;background:#fff"><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><div class="stb-left-cell" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:inline-block"><div class="stb-image-box" style="text-align:center;margin:0;width:100%;box-sizing:border-box;clear:both"><table border="0" cellpadding="0" cellspacing="0" style="width:100%" align="center"><tbody><tr><td style="padding:15px 15px 15px 15px;padding-bottom:0;text-align:center;font-size:0;border:0;line-height:0;width:100%!important;box-sizing:border-box"><img src="https://img.stibee.com/35189_1703577966.png" style="width:100%;display:inline;vertical-align:bottom;text-align:center;max-width:100%;height:auto;border:0" width="600" class="stb-center"></td></tr></tbody></table></div><div class="stb-text-box" style="text-align:left;margin:0;line-height:1.7;word-break:break-word;font-size:16px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#000;clear:both;border:0;mso-line-height-rule-rule:exactly"><table class="stb-text-box-inner" border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 15px 15px 15px;padding-top:20px;font-size:16px;line-height:1.7;word-break:break-word;color:#000;border:0;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;width:100%!important"><div style="text-align:center"><span style="font-size:20px"><span class="link-edited stb-bold" style="font-weight:700">${userName}&#45784; </span><span class="link-edited stb-bold" style="font-weight:700">QAing&#50640; &#44032;&#51077;&#54616;&#49888; &#44152; &#54872;&#50689;&#54644;&#50836;! &#128588;</span></span></div></td></tr></tbody></table></div></div></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><table border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" align="left" width="100%"><tbody><tr><td style="padding:15px 15px 15px 15px;border:0"><table class="stb-partition" style="width:100%;height:0;background:0 0;padding:0;border-top-width:1px;border-top-style:dotted;border-top-color:#999;margin:0 0;border-collapse:separate"></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><div class="stb-left-cell" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:inline-block"><div class="stb-text-box" style="text-align:left;margin:0;line-height:1.7;word-break:break-word;font-size:16px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#000;clear:both;border:0;mso-line-height-rule-rule:exactly"><table class="stb-text-box-inner" border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 15px 15px 15px;font-size:16px;line-height:1.7;word-break:break-word;color:#000;border:0;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;width:100%!important"><div><div style="text-align:center"><span style="font-size:18px">&#54868;&#47732; &#52897;&#52432;&#47484; &#50948;&#54644; QA&#47484; &#47688;&#52628;&#51648; &#47560;&#49464;&#50836;.&nbsp;</span></div><div style="text-align:center"><span style="font-size:18px">&#49892;&#49884;&#44036; &#48513;&#47560;&#53356;&#47484; &#53685;&#54644; QA&#47484; &#45908; &#48736;&#47476;&#44256; &#51221;&#54869;&#54616;&#44172;!</span></div><div style="text-align:center"><span style="font-size:18px">QAing&#51060; QA &#47532;&#49548;&#49828;&#47484; &#51460;&#50668;&#46300;&#47540;&#44172;&#50836;! &#128588;</span></div></div></td></tr></tbody></table></div></div></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><div class="stb-left-cell" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:inline-block"><div class="stb-text-box" style="text-align:left;margin:0;line-height:1.7;word-break:break-word;font-size:16px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#000;clear:both;border:0;mso-line-height-rule-rule:exactly"><table class="stb-text-box-inner" border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 25px 15px 25px;font-size:16px;line-height:1.7;word-break:break-word;color:#000;border:0;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;width:100%!important"><div style="text-align:center">&#128205; &#45433;&#54868; &#51473; &#49892;&#49884;&#44036; &#51060;&#49800; &#51200;&#51109;</div><div style="text-align:center">&#128205; &#50689;&#49345; &#46608;&#45716; &#51060;&#48120;&#51648;, &#50896;&#54616;&#45716;&#45824;&#47196;!</div><div style="text-align:center">&#128205; &#53364;&#46972;&#50864;&#46300; &#51200;&#51109; &#48143; &#47553;&#53356;&#47196; &#48736;&#47480; &#44277;&#50976;</div></td></tr></tbody></table></div></div></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><div class="stb-left-cell" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:inline-block"><div class="stb-text-box" style="text-align:left;margin:0;line-height:1.7;word-break:break-word;font-size:16px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#000;clear:both;border:0;mso-line-height-rule-rule:exactly"><table class="stb-text-box-inner" border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 15px 15px 15px;font-size:16px;line-height:1.7;word-break:break-word;color:#000;border:0;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;width:100%!important"><div style="text-align:center"><span>&#127873; QAing&#44284; &#54632;&#44760; &#50416;&#47732; &#45908; &#51339;&#51008; QA&#49884;&#53944; &#53596;&#54540;&#47551;&#51008;</span></div><div style="text-align:center"><span>&#50500;&#47000; &#47553;&#53356;&#50640;&#49436; &#54869;&#51064;&#54616;&#49892; &#49688; &#51080;&#50612;&#50836;!</span></div><div style="text-align:center"><span><a href="https://bit.ly/qaing_event" target="_blank" style="color:#00f;font-weight:400;text-decoration:none">https://bit.ly/qaing_event</a></span></div></td></tr></tbody></table></div></div></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><div class="stb-left-cell" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;display:inline-block"><div class="stb-cta-box" style="clear:both"><table border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 15px 15px 15px;border:0;width:100%!important;text-align:center"><table class="stb-cell-wrap-cta" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="margin:0 auto;color:#fff;mso-table-lspace:0;mso-table-rspace:0;border-collapse:separate!important;table-layout:fixed;background:#0cc;background-color:#0cc;border-radius:500px;border-width:1px;border-style:solid;border-color:#0cc;border:1px solid #0cc;mso-line-height-rule:exactly;line-height:1;width:100%"><tbody><tr><td style="background:#0cc;background-color:#0cc;border-radius:500px;text-align:center;padding:0;width:100%!important" valign="top" align="center"><a href="http://app.qaing.co" style="font-size:20px;display:block;color:#fff;text-decoration:none;outline:0;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-align:center;padding:20px 28px;width:100%;box-sizing:border-box;vertical-align:top;mso-line-height-rule:exactly;line-height:1" target="_blank">QAing &#49324;&#50857;&#54616;&#47084; &#44032;&#44592;</a></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr></tr></tbody></table></td></tr></tbody></table></div></div></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><table border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" align="left" width="100%"><tbody><tr><td style="padding:15px 15px 15px 15px;border:0"><table class="stb-partition" style="width:100%;height:0;background:0 0;padding:0;border-top-width:1px;border-top-style:dotted;border-top-color:#999;margin:0 0;border-collapse:separate"></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div><div class="stb-block-outer"><table class="stb-block stb-cols-1" border="0" cellpadding="0" cellspacing="0" style="overflow:hidden;margin:0 auto;padding:0;width:100%;max-width:630px;clear:both;line-height:1.7;border-width:0;border:0;font-size:14px;border:0;box-sizing:border-box" width="100%"><tbody><tr><td><table class="stb-cell-wrap" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;font-size:0"><table class="stb-cell" border="0" cellpadding="0" cellspacing="0" style="max-width:630px;width:100%!important;margin:0;vertical-align:top;border-collapse:collapse;box-sizing:border-box;font-size:unset;mso-table-lspace:0;mso-table-rspace:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%" align="left" width="100%"><tbody><tr><td class="stb-text-box" style="padding:0 0;text-align:center;margin:0;line-height:1.7;word-break:break-word;font-size:12px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;color:#747579;border:0"><table border="0" cellpadding="0" cellspacing="0" style="width:100%"><tbody><tr><td style="padding:15px 15px 15px 15px;font-family:AppleSDGothic,apple sd gothic neo,noto sans korean,noto sans korean regular,noto sans cjk kr,noto sans cjk,nanum gothic,malgun gothic,dotum,arial,helvetica,MS Gothic,sans-serif!important;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;line-height:1.7;word-break:break-word;border:0;width:100%;text-align:center"><div>QAing | &#54016;&#49828;&#54028;&#47476;&#53440;<br>contact@qaing.co<br><span>&#49436;&#50872;&#53945;&#48324;&#49884; &#44053;&#45224;&#44396; &#53580;&#54756;&#46976;&#47196;44&#44600; 8 12&#52789; (&#50500;&#51060;&#53080;&#50669;&#49340;&#48716;&#46377;) | 1522-8016</span><br><span class="stb-bold" style="font-weight:700"></span></div></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></div></td></tr></tbody></table></div></body></html>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
