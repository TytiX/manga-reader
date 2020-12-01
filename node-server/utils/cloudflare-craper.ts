import cheerio from "cheerio";
import delay from "delay";
import url from "url";
import tough from "tough-cookie";

const clearenceCookies = {};
export function axiosCloudflare(axios) {
  function isCloudflareResponse(response) {
    if (
      typeof response.headers["cf-ray"] !== "undefined" &&
      typeof response.headers["server"] !== "undefined" &&
      response.headers["server"] === "cloudflare"
    ) {
      response.$ = cheerio.load(response.data);

      if (response.$("#challenge-form input[name=jschl_vc]").length > 0)
        return true;
    }

    return false;
  }

  function interceptCloudflare(response) {
    const $ = response.$;

    const $form = $("#challenge-form");
    const targetUrl = $form.attr("action");
    const jschl_vc = $form.find("input[name=jschl_vc]").attr("value");
    const pass = $form.find("input[name=pass]").attr("value");

    const urlObj = url.parse(response.config.url);

    const match = response.data.match(
        /getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value\s*=.+?)\r?\n(?:[^{<>]*},\s*(\d{4,}))?/
    );
    const scriptRows = $("script").first().html().split("\n");

    // TODO: fix this to work
    const part1 = scriptRows[8].match(/^.*, (\w+)={"(\w+)":([!+()[\]]+)};.*$/);
    let test = eval('_cf_chl_enter()');

    if (part1 === null) throw new Error("Cloudflare interception failed!");

    const varname = part1[1] + "." + part1[2];
    let jschl_answer = eval(part1[3]);

    const challanges = scriptRows[15].split(";");

    {
      let x = jschl_answer;
      const saveToExec = /^x[+\-*]=[!+()[\]]+$/;

      challanges.forEach((challenge) => {
        challenge = challenge.replace(varname, "x");

        if (saveToExec.test(challenge)) eval(challenge);
      });

      jschl_answer = x;
    }

    jschl_answer += urlObj.hostname.length;

    return delay(5000).then(() => {
      return axios({
        method: "get",
        url: url.resolve(urlObj.href, targetUrl),
        params: { jschl_vc, pass, jschl_answer },
        validateStatus: (status) => status === 302,
        maxRedirects: 0,
      }).then((innerResponse) => {
        innerResponse.headers["set-cookie"].forEach((cookieString) => {
          const cookie = tough.Cookie.parse(cookieString);

          if (cookie.key === "cf_clearance")
            clearenceCookies[urlObj.hostname] = cookie.value;
        });

        return axios(response.config);
      });
    });
  }

  function cloudflareRequestInterceptor(config) {
    const urlObj = url.parse(config.url);

    if (typeof clearenceCookies[urlObj.hostname] !== "undefined") {
      if (typeof config.headers["cookie"] === "undefined")
        config.headers["cookie"] = "";
      else config.headers["cookie"] += ";";

      config.headers["cookie"] +=
        "cf_clearance=" + clearenceCookies[urlObj.hostname];
    }

    return config;
  }

  function onChallenge(options, response, body) {
    const callback = options.callback;
    const uri = response.request.uri;
    // The query string to send back to Cloudflare
    const payload = {
      /* s, jschl_vc, pass, jschl_answer */
    };

    let cause;
    let error;

    if (options.challengesToSolve === 0) {
      cause = "Cloudflare challenge loop";
    //   error = new CloudflareError(cause, options, response);
      error.errorType = 4;

      return callback(error);
    }

    let timeout = parseInt(options.cloudflareTimeout);
    let match;

    match = body.match(/name="(.+?)" value="(.+?)"/);

    if (match) {
      const hiddenInputName = match[1];
      payload[hiddenInputName] = match[2];
    }

    match = body.match(/name="jschl_vc" value="(\w+)"/);
    if (!match) {
      cause = "challengeId (jschl_vc) extraction failed";
    //   return callback(new ParserError(cause, options, response));
    }

    // payload.jschl_vc = match[1];

    match = body.match(/name="pass" value="(.+?)"/);
    if (!match) {
      cause = "Attribute (pass) value extraction failed";
    //   return callback(new ParserError(cause, options, response));
    }

    // payload.pass = match[1];

    match = body.match(
      /getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value\s*=.+?)\r?\n(?:[^{<>]*},\s*(\d{4,}))?/
    );
    if (!match) {
      cause = "setTimeout callback extraction failed";
    //   return callback(new ParserError(cause, options, response));
    }

    if (isNaN(timeout)) {
      if (match[2] !== undefined) {
        timeout = parseInt(match[2]);

        if (timeout > options.cloudflareMaxTimeout) {
        //   if (debugging) {
            console.warn(
              "Cloudflare's timeout is excessive: " + timeout / 1000 + "s"
            );
        //   }

          timeout = options.cloudflareMaxTimeout;
        }
      } else {
        cause = "Failed to parse challenge timeout";
        // return callback(new ParserError(cause, options, response));
      }
    }

    // Append a.value so it's always returned from the vm
    response.challenge = match[1] + "; a.value";

    try {
    //   const ctx = new sandbox.Context({ hostname: uri.hostname, body });
    //   payload.jschl_answer = sandbox.eval(response.challenge, ctx);
    } catch (error) {
      error.message = "Challenge evaluation failed: " + error.message;
    //   return callback(new ParserError(error, options, response));
    }

    // if (isNaN(payload.jschl_answer)) {
    //   cause = "Challenge answer is not a number";
    //   return callback(new ParserError(cause, options, response));
    // }

    // Prevent reusing the headers object to simplify unit testing.
    options.headers = Object.assign({}, options.headers);
    // Use the original uri as the referer and to construct the answer uri.
    options.headers.Referer = uri.href;
    // Check is form to be submitted via GET or POST
    match = body.match(/id="challenge-form" action="(.+?)" method="(.+?)"/);
    if (match && match[2] && match[2] === "POST") {
      options.uri = uri.protocol + "//" + uri.host + match[1];
      // Pass the payload using body form
      options.form = payload;
      options.method = "POST";
    } else {
      // Whatever is there, fallback to GET
      options.uri = uri.protocol + "//" + uri.host + "/cdn-cgi/l/chk_jschl";
      // Pass the payload using query string
      options.qs = payload;
    }
    // Decrement the number of challenges to solve.
    options.challengesToSolve -= 1;
    // baseUrl can't be used in conjunction with an absolute uri
    if (options.baseUrl !== undefined) {
      options.baseUrl = undefined;
    }
    // Change required by Cloudflate in Jan-Feb 2020
    options.uri = options.uri.replace(/&amp;/g, "&");

    // Make request with answer after delay.
    timeout -= Date.now() - response.responseStartTime;
    // setTimeout(performRequest, timeout, options, false);
  }

  function cloudflareResponseInterceptor(response) {
    if (isCloudflareResponse(response)) return interceptCloudflare(response);

    return response;
  }

  function cloudflareResponseErrorInterceptor(error) {
    if (isCloudflareResponse(error.response))
      return interceptCloudflare(error.response);

    return Promise.reject(error);
  }

  axios.interceptors.request.use(cloudflareRequestInterceptor);
  axios.interceptors.response.use(
    cloudflareResponseInterceptor,
    cloudflareResponseErrorInterceptor
  );
}
