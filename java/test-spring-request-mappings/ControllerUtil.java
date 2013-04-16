package com.armstrong.www.residential.ceilings.utility;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: jwstoltz
 * Date: 4/16/13
 * Time: 11:55 AM
 * To change this template use File | Settings | File Templates.
 */
public class ControllerUtil {
    private static final Pattern contentPattern = Pattern.compile("(/[a-z|A-Z][a-z|A-Z]-[a-z|A-Z][a-z|A-Z])/(.+)");

    public static String parseHtmlFromURI(String uri) {
        Matcher matcher = contentPattern.matcher(uri);
        if (matcher.matches()) {
            return matcher.group(2);
        }

        return null;
    }
}
