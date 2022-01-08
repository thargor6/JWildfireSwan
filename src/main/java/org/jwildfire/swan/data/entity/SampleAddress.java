package org.jwildfire.swan.data.entity;

import com.vaadin.fusion.Nonnull;
import javax.persistence.Entity;
import org.jwildfire.swan.data.AbstractEntity;

@Entity
public class SampleAddress extends AbstractEntity {

    @Nonnull
    private String street;
    @Nonnull
    private String postalCode;
    @Nonnull
    private String city;
    @Nonnull
    private String state;
    @Nonnull
    private String country;

    public String getStreet() {
        return street;
    }
    public void setStreet(String street) {
        this.street = street;
    }
    public String getPostalCode() {
        return postalCode;
    }
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getState() {
        return state;
    }
    public void setState(String state) {
        this.state = state;
    }
    public String getCountry() {
        return country;
    }
    public void setCountry(String country) {
        this.country = country;
    }

}
