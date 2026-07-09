# Renaissance API cURL Tests

Bash scripts to test various API endpoints on the Renaissance remote service.

## Prerequisites

1. Ensure the remote-service app is running locally:
   ```bash
   pnpm dev
   ```
   *(By default, it will be listening on `http://127.0.0.1:8080`)*

---

## Instructions

1. **Configure Placeholders**: Open the script file you wish to run and replace any uppercase placeholders (such as `<EMAIL>` or `<YOUR_ACCESS_TOKEN>`) with real values.
2. **Execute Script**: Run the script using `bash` from the project root directory:
   ```bash
   bash etc/curl/<script_name>
   ```

   *Example:*
   ```bash
   bash etc/curl/user_register
   ```

---

## Alternative Execution (Executable Scripts)

You can make the script files executable and run them directly:

```bash
chmod +x etc/curl/<script_name>
./etc/curl/<script_name>
```
