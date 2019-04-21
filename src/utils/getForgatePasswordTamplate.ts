export const getForgatePasswordTamplate = (link: string, username: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <style>
        @import url(https://fonts.googleapis.com/css?family=Open+Sans);
  
        body {
          font-family: 'Open Sans', 'sans-serif';
          color: #fff !important;
        }
        .main-table {
          background-color: #ffffff !important;
          background: #ffffff !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .button {
          border-radius: 5px !important;
          padding: 10px 25px !important;
          font-size: 20px !important;
          text-decoration: none !important;
          margin: 10px !important;
          color: #fff !important;
          position: relative !important;
          display: inline-block !important;
          background-color: #1cbd5f !important;
          box-shadow: 0px 5px 0px 0px #0a9e48 !important;
        }
        .button:hover {
          background-color: #33ca72 !important;
        }
      </style>
    </head>
    <body>
      <table cellpadding="8" cellspacing="0" border="0" class="main-table">
        <tbody>
          <tr>
            <td valign="top">
              <table cellpadding="0" cellspacing="0" align="center" border="0">
                <tbody>
                  <tr>
                    <td>
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        style="border-radius:8px; box-shadow: 0 1px 3px rgba(17, 17, 17, 0.288)"
                        border="0"
                        align="center"
                      >
                        <tbody>
                          <tr>
                            <td colspan="3" height="36"></td>
                          </tr>
                          <tr>
                            <td width="36"></td>
                            <td width="454" align="left" valign="top">
                              Dear ${username},<br /><br />A request was made to reset the password for your apollo-server
                              account. You can reset your password by clicking the following button. <br /><br /><br />
                              <center>
                                <a href="${link}" target="_blank" class="button">
                                  Reset Password
                                </a>
                              </center>
                              <br /><br />If you did not need to reset your password, please ignore this email and the
                              link will be expired in 30 minutes.<br /><br /><br />Thanks,<br />Best Regards,<br />The
                              apollo-server Team
                            </td>
                            <td width="36"></td>
                          </tr>
                          <tr>
                            <td colspan="3" height="36"></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>  
  `
}
