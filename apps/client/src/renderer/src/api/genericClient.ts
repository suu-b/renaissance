const API_URL = "http://localhost:3000";

// change any
async function call(path: string, options: any = {}) {
    const response = await fetch(`${API_URL}/${path}`, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export const generic_client = {
  get(path: string) {
    return call(path);
  },

  post(path: string, body: any) {
    return call(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(path: string, body: any) {
    return call(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(path: string) {
    return call(path, {
      method: "DELETE",
    });
  },
};