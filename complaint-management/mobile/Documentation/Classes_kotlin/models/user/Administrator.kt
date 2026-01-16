package com.cms.models.user

import com.cms.enums.UserRole

class Administrator(
    id: String,
    name: String,
    email: String
) : User(id, name, email, UserRole.ADMINISTRATOR)
