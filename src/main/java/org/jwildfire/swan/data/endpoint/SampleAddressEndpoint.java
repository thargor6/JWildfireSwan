package org.jwildfire.swan.data.endpoint;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.fusion.Endpoint;
import com.vaadin.fusion.Nonnull;
import java.util.Optional;
import org.jwildfire.swan.data.entity.SampleAddress;
import org.jwildfire.swan.data.service.SampleAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Endpoint
@AnonymousAllowed
public class SampleAddressEndpoint {

    private SampleAddressService service;

    public SampleAddressEndpoint(@Autowired SampleAddressService service) {
        this.service = service;
    }

    @Nonnull
    public Page<@Nonnull SampleAddress> list(Pageable page) {
        return service.list(page);
    }

    public Optional<SampleAddress> get(@Nonnull Integer id) {
        return service.get(id);
    }

    @Nonnull
    public SampleAddress update(@Nonnull SampleAddress entity) {
        return service.update(entity);
    }

    public void delete(@Nonnull Integer id) {
        service.delete(id);
    }

    public int count() {
        return service.count();
    }

}
