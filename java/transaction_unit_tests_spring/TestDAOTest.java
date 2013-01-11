package com.armstrong.www.appname.dao;
import java.sql.SQLException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.Test;

import com.armstrong.www.appname.model.TestDataModel;
import com.armstrong.www.testutils.IntegrationTest;

import static org.junit.Assert.*;

public class TestDAOTest extends IntegrationTest {
    @SuppressWarnings("unused")
    private static final Log log_ = LogFactory.getLog(TestDAOTest.class);

    public void setUp() throws SQLException {
        super.setUp();  
        /*
         * Any set up data created here will be
         * automatically rolled back at the end of each transacton (each test).
         */
        jdbcTemplate.update("insert into employee(empid, empname) values (?, ?)", new Object[] {402, "Test User"}); 
    }
    
    @Test
    public void testGetTestObject() {
        TestDAO testDAO = new TestDAO();
        TestDataModel testDataModel = testDAO.getTestObject(402);
        assertEquals("Test User", testDataModel.getEmpname());
    }
    
    @Test
    public void testInsertTestObject() {
        /* We can safely test insert statements without actually creating data ... it will all be rolled back*/
        TestDAO testDAO = new TestDAO();
        testDAO.insertTestObject(401, "Test User");
        assertTrue(jdbcTemplate.queryForList("select * from employee where empid = '401'").size() > 0);
    }
}
