const INVALID_VALUES = ["undefined", "null", ""];

export const isTokenValido = (token) => {
    return typeof token === "string" && !INVALID_VALUES.includes(token.trim());
};

const elegirPrimeroValido = (...valores) => {
    return valores.find((valor) => {
        if (valor === null || valor === undefined) return false;
        if (typeof valor === "string") return !INVALID_VALUES.includes(valor.trim());
        return true;
    });
};

export const decodificarPayloadToken = (token) => {
    if (!isTokenValido(token)) return {};

    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return {};

        const payload = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(payload)
                .split("")
                .map((caracter) => `%${caracter.charCodeAt(0).toString(16).padStart(2, "0")}`)
                .join("")
        );//transformar cada caracter a su valor hexadecimal y agregar % para decodificar correctamente caracteres especiales

        return JSON.parse(json);
    } catch {
        return {};
    }
};

export const normalizarAuthResponse = (data) => {
    const root = data ?? {};
    const payload = root.data ?? root;

    const token = elegirPrimeroValido(
        payload.token,
        payload.accessToken,
        payload.access_token,
        payload.clientToken,
        payload.clienteToken,
        payload.tokenCliente,
        payload.authToken,
        payload.jwt,
        payload.jwtToken,
        payload.usuario?.token,
        payload.usuario?.clientToken,
        payload.user?.token,
        payload.user?.clientToken,
        payload.cliente?.token,
        payload.cliente?.clientToken,
        root.token,
        root.accessToken,
        root.access_token,
        root.clientToken,
        root.clienteToken,
        root.tokenCliente,
        root.authToken,
        root.jwt,
        root.jwtToken,
        root.usuario?.token,
        root.usuario?.clientToken,
        root.user?.token,
        root.user?.clientToken,
        root.cliente?.token,
        root.cliente?.clientToken
    );

    const tokenPayload = decodificarPayloadToken(token);

    const usuarioBase = elegirPrimeroValido(
        payload.usuario,
        payload.user,
        payload.cliente,
        payload.client,
        payload.data?.usuario,
        payload.data?.user,
        payload.data?.cliente,
        root.usuario,
        root.user,
        root.cliente,
        root.client
    );

    const clientId = elegirPrimeroValido(
        payload.clientId,
        payload.clienteId,
        payload.usuarioId,
        payload.userId,
        payload.id,
        payload._id,
        payload.usuario?._id,
        payload.usuario?.id,
        payload.user?._id,
        payload.user?.id,
        payload.cliente?._id,
        payload.cliente?.id,
        root.clientId,
        root.clienteId,
        root.usuarioId,
        root.userId,
        root.id,
        root._id,
        root.usuario?._id,
        root.usuario?.id,
        root.user?._id,
        root.user?.id,
        root.cliente?._id,
        root.cliente?.id,
        tokenPayload.clientId,
        tokenPayload.clienteId,
        tokenPayload.usuarioId,
        tokenPayload.userId,
        tokenPayload.id,
        tokenPayload._id,
        tokenPayload.sub
    );

    const email = elegirPrimeroValido(
        usuarioBase?.email,
        payload.email,
        payload.usuario?.email,
        payload.user?.email,
        payload.cliente?.email,
        root.email,
        root.usuario?.email,
        root.user?.email,
        root.cliente?.email,
        tokenPayload.email
    );

    const plan = elegirPrimeroValido(
        usuarioBase?.plan,
        payload.plan,
        payload.usuario?.plan,
        payload.user?.plan,
        payload.cliente?.plan,
        root.plan,
        root.usuario?.plan,
        root.user?.plan,
        root.cliente?.plan,
        tokenPayload.plan
    );

    const rol = elegirPrimeroValido(
        usuarioBase?.rol,
        usuarioBase?.role,
        payload.rol,
        payload.role,
        payload.usuario?.rol,
        payload.usuario?.role,
        payload.user?.rol,
        payload.user?.role,
        payload.cliente?.rol,
        payload.cliente?.role,
        root.rol,
        root.role,
        root.usuario?.rol,
        root.usuario?.role,
        root.user?.rol,
        root.user?.role,
        root.cliente?.rol,
        root.cliente?.role,
        tokenPayload.rol,
        tokenPayload.role
    );

    const usuario = elegirPrimeroValido(usuarioBase, clientId, email, plan, rol)
        ? {
            ...(typeof usuarioBase === "object" ? usuarioBase : {}),
            _id: usuarioBase?._id || usuarioBase?.id || clientId,
            id: usuarioBase?.id || usuarioBase?._id || clientId,
            email,
            plan,
            rol,
            role: usuarioBase?.role || rol
        }
        : null;

    return { token, usuario, clientId };
};
