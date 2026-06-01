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

    const usuario = elegirPrimeroValido(
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
        root.cliente?.id
    );

    return { token, usuario, clientId };
};
