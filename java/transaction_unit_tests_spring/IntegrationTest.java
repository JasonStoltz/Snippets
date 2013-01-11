package com.armstrong.www.testutils;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import mockit.Delegate;
import mockit.Mocked;
import mockit.NonStrictExpectations;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import com.armstrong.utility.webutil.DbUtil;

/**
 * This represents an "Integration Test". Meaning, we're not simply testing the
 * logic contained within a particular class, we're also testing it's
 * "integration" with Spring, Endeca, data sources, etc. This class is meant to
 * encapsulate all common configurations and set up for all integrations tests
 * within a project.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:C:\\opt\\data\\src\\AWI6\\webapps\\site-template\\web\\WEB-INF\\applicationContext.xml", "classpath:/com/armstrong/www/testutils/test-context.xml"})
@TransactionConfiguration(transactionManager="transactionManager", defaultRollback=true)
@Transactional
public class IntegrationTest {
	
	@Autowired
    protected ApplicationContext applicationContext;
	protected DataSource dataSource;
	protected JdbcTemplate jdbcTemplate;
    
	//Mocked "statically" so that all instances of this method will use the mocked object
    @Mocked (methods = {"getConnection"})
    private DbUtil dbutil;
    
	@BeforeClass
    public static void init() {
		/*Some legacy code requires this to be set, so that certain dependencies can be loaded at Application
		 * Context initialization.
		 */
        //System.setProperty("dbpool.path", "C:\\opt\\apps\\tomcat5\\conf\\dbpool.properties");
        
		/*Spring can be leveraged to mock a JNDI context (as we are doing
		below). If the bean is being looked up and injected in a Spring
		Context configuration (i.e., "<jee:jndi-lookup>"), a String could
		instead be used in a separate test context configuration.*/
        
	    /*  SimpleNamingContextBuilder builder = null;
        try {
            builder = SimpleNamingContextBuilder.emptyActivatedContextBuilder();
            builder.bind("brandMail/postUrlPrefix","http://www.pages05.net/armstrongworldindustries");
            builder.bind("ENE_HOST","lsnas048");
        } catch (NamingException e) {
            throw new RuntimeException();
        }*/
    }
	
	@SuppressWarnings("rawtypes")
	@Before
	public void setUp() throws SQLException {
		//Proving that "Before" runs once before each test.
    	System.out.println("Before executing");
    	
    	jdbcTemplate = (JdbcTemplate)applicationContext.getBean("jdbcTemplate");
        dataSource = (DataSource)applicationContext.getBean("dataSource");
        
    	new NonStrictExpectations() {{
			/*
			 * Since connections often come directly from "DbUtil", and not
			 * our datasource, we need to override that behavior here.
			 */
            DbUtil.getConnection();             
        	result = new Delegate(){
        		@SuppressWarnings("unused")
				Connection getConnection() throws SQLException{
        			Connection temp = DataSourceUtils.getConnection(dataSource);
            		if (!DataSourceUtils.isConnectionTransactional(temp, dataSource)) {
            			throw new RuntimeException("Connection is not transactional ... check your data source");
            		}
                	temp.setAutoCommit(false);//Needed to ensure rollback will work
                	return temp;
        		}
    		};
         }};
	}
}
