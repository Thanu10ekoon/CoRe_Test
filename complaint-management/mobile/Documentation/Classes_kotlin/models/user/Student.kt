package com.cms.models.user

import com.cms.enums.UserRole

class Student(
    id: String,
    name: String,
    email: String
) : User(id, name, email, UserRole.STUDENT)
