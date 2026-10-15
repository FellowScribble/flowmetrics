package com.flowmetrics.backend.service;

import com.flowmetrics.backend.entity.DemoSession;

public interface DemoSessionService {

    DemoSession startSession();

    DemoSession getActiveSession(String sessionToken);
}