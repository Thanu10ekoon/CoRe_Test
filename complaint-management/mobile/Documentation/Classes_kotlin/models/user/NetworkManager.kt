package com.cms.models.user

import com.cms.enums.UserRole

class NetworkManager(
    id: String,
    name: String,
    email: String
) : User(id, name, email, UserRole.NETWORK_MANAGER)
