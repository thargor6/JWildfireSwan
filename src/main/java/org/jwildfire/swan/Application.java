package org.jwildfire.swan;

import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;
import com.vaadin.flow.theme.Theme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * The entry point of the Spring Boot application.
 *
 * Use the @PWA annotation make the application installable on phones, tablets
 * and some desktop browsers.
 *
 */
@SpringBootApplication(scanBasePackages = "org.jwildfire")
@Theme(value = "jwildfireswan")
@PWA(name = "JWildfire Swan", shortName = "JWildfire Swan", offlineResources = {"images/logo.png"})
@NpmPackage(value = "@polymer/paper-slider", version = "3.0.1")
@JsModule("@polymer/paper-slider/paper-slider.js")
public class Application extends SpringBootServletInitializer implements AppShellConfigurator {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
