<?php
/**
 * Carregador simples de arquivo .env (sem dependências externas).
 */

function load_env(string $path): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $cache = [];

    if (!is_file($path)) {
        return $cache;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        if (strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if (strlen($value) >= 2) {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        $cache[$key] = $value;
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }

    return $cache;
}

function env(string $key, $default = null)
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}
