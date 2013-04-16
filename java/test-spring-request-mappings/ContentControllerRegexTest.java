package com.armstrong.www.residential.ceilings;

import com.armstrong.www.residential.ceilings.web.controllers.ContentController;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter;
import org.springframework.web.servlet.mvc.multiaction.NoSuchRequestHandlingMethodException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.*;

/**
 * Created by IntelliJ IDEA.
 * User: jwstoltz
 * Date: 4/16/13
 * Time: 10:17 AM
 * To change this template use File | Settings | File Templates.
 */
public class ContentControllerRegexTest {
/*
    @Test
    public void testRegex() {
        Pattern pattern = Pattern.compile("/(.+)(\\.html)");
        Pattern pattern2 = Pattern.compile("([a-z|A-Z][a-z|A-Z]-[a-z|A-Z][a-z|A-Z])/(.+)");
        {
            Matcher matcher = pattern.matcher("/en-us/content/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("content/whatever", value);

        }
        {
            Matcher matcher = pattern.matcher("/es-us/content/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("content/whatever", value);

        }
        {
            Matcher matcher = pattern.matcher("/fr-ca/content/content/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("content/content/whatever", value);

        }
        {
            Matcher matcher = pattern.matcher("/en-us/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("whatever", value);

        }
        {
            Matcher matcher = pattern.matcher("/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("whatever", value);
        }
        {
            Matcher matcher = pattern.matcher("/content/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("content/whatever", value);
        }
        {
            Matcher matcher = pattern.matcher("/content/content/whatever.html");
            assertTrue(matcher.matches());
            String value = matcher.group(1);

            matcher = pattern2.matcher(matcher.group(1));
            if (matcher.matches()) {
                value = matcher.group(2);
            }

            System.out.println(value);
            assertEquals("content/content/whatever", value);
        }

        //Negative cases
        {
            Matcher matcher = pattern.matcher("/en-us/content/whatever.asp");
            assertFalse(matcher.matches());
        }
        {
            Matcher matcher = pattern.matcher("/en-us/content/whateverhtml");
            assertFalse(matcher.matches());
        }
        {
            Matcher matcher = pattern.matcher("/en-us/content/whatever.html5");
            assertFalse(matcher.matches());
        }
        {
            Matcher matcher = pattern.matcher("/en-us/content/whatever");
            assertFalse(matcher.matches());
        }
        {
            Matcher matcher = pattern.matcher("/en-us/content.json");
            assertFalse(matcher.matches());
        }
    }*/

    @Test
    public void testSpringMapping() throws Exception {
        AnnotationMethodHandlerAdapter handler = new AnnotationMethodHandlerAdapter();
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();

        ContentControllerMock controller = new ContentControllerMock();

        req.setRequestURI("/en-us/whatever.html");
        handler.handle(req, res, controller);

        req.setRequestURI("/en-us/whatever.html");
        handler.handle(req, res, controller);

        req.setRequestURI("/en-us/content/whatever.html");
        handler.handle(req, res, controller);

        try {
            req.setRequestURI("/en-us/content/whatever.asp");
            handler.handle(req, res, controller);
            fail();
        } catch (Throwable e) {
            assertTrue(e instanceof NoSuchRequestHandlingMethodException);
        }
        
    }
}
