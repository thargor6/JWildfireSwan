package org.jwildfire.swan.flames.endpoint;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.fusion.Endpoint;
import org.jwildfire.swan.flames.model.Flame;
import org.jwildfire.swan.flames.service.FlamesService;
import org.springframework.beans.factory.annotation.Autowired;
import com.vaadin.fusion.Nonnull;

@Endpoint
@AnonymousAllowed
public class FlamesEndpoint {

    private final FlamesService service;

    public FlamesEndpoint(@Autowired FlamesService service) {
        this.service = service;
    }

    public int count() {
        return service.count();
    }

    public @Nonnull Flame getFlame() {
        return new Flame();
    }

}
