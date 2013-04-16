package com.armstrong.www.residential.ceilings;

import com.armstrong.www.residential.ceilings.utility.ControllerUtil;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: jwstoltz
 * Date: 4/16/13
 * Time: 11:35 AM
 * To change this template use File | Settings | File Templates.
 */
@Controller
public class ContentControllerMock {

    @RequestMapping("/{locale}/**/{content}.html")
    public String normal(@PathVariable String content, Model model, HttpServletRequest request, HttpServletResponse response) {
        return ControllerUtil.parseHtmlFromURI(request.getRequestURI());
    }
}
