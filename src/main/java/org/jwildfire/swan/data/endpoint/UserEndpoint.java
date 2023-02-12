package org.jwildfire.swan.data.endpoint;

import org.jwildfire.swan.data.entity.User;
import org.jwildfire.swan.security.AuthenticatedUser;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.Endpoint;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

@Endpoint
@AnonymousAllowed
public class UserEndpoint {

    @Autowired
    private AuthenticatedUser authenticatedUser;

    public Optional<User> getAuthenticatedUser() {
        return authenticatedUser.get();
    }
}
