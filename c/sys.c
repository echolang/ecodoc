/*
 * OS bits std does not have: run a program with stdout captured, a file's
 * mtime, and whether a path is a file or a directory.
 *
 * argv arrives packed: `argc` NUL-terminated strings back to back.
 */

#define _POSIX_C_SOURCE 200809L
#if defined(__APPLE__)
#define _DARWIN_C_SOURCE
#endif

#include <errno.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>

/* stdout captured, stderr inherited so echoc's diagnostics still reach you */
int32_t ecodoc_run(const char *packed, int32_t argc, char **out, uint64_t *out_len)
{
    *out = NULL;
    *out_len = 0;

    char **argv = calloc((size_t)argc + 1, sizeof(char *));
    if (argv == NULL) {
        return -1;
    }
    const char *at = packed;
    for (int32_t i = 0; i < argc; i++) {
        argv[i] = (char *)at;
        at += strlen(at) + 1;
    }

    int pipefd[2];
    if (pipe(pipefd) != 0) {
        free(argv);
        return -1;
    }

    pid_t pid = fork();
    if (pid < 0) {
        close(pipefd[0]);
        close(pipefd[1]);
        free(argv);
        return -1;
    }

    if (pid == 0) {
        dup2(pipefd[1], STDOUT_FILENO);
        close(pipefd[0]);
        close(pipefd[1]);
        execvp(argv[0], argv);
        _exit(127);
    }

    close(pipefd[1]);
    free(argv);

    size_t cap = 65536;
    size_t len = 0;
    char *buf = malloc(cap);
    if (buf == NULL) {
        close(pipefd[0]);
        waitpid(pid, NULL, 0);
        return -1;
    }

    for (;;) {
        if (len + 65536 > cap) {
            cap *= 2;
            char *grown = realloc(buf, cap);
            if (grown == NULL) {
                free(buf);
                close(pipefd[0]);
                waitpid(pid, NULL, 0);
                return -1;
            }
            buf = grown;
        }
        ssize_t n = read(pipefd[0], buf + len, 65536);
        if (n > 0) {
            len += (size_t)n;
        } else if (n == 0 || errno != EINTR) {
            break;
        }
    }
    close(pipefd[0]);

    int status = 0;
    waitpid(pid, &status, 0);

    *out = buf;
    *out_len = len;
    if (WIFEXITED(status)) {
        return WEXITSTATUS(status);
    }
    return 128;
}

void ecodoc_free(char *p)
{
    free(p);
}

/* nanoseconds since the epoch the file was last written, or -1 */
int64_t ecodoc_mtime(const char *path)
{
    struct stat st;
    if (stat(path, &st) != 0) {
        return -1;
    }
#if defined(__APPLE__)
    return (int64_t)st.st_mtimespec.tv_sec * 1000000000 + st.st_mtimespec.tv_nsec;
#else
    return (int64_t)st.st_mtim.tv_sec * 1000000000 + st.st_mtim.tv_nsec;
#endif
}

/* 0 none, 1 file, 2 directory */
int32_t ecodoc_kind(const char *path)
{
    struct stat st;
    if (stat(path, &st) != 0) {
        return 0;
    }
    return S_ISDIR(st.st_mode) ? 2 : 1;
}
