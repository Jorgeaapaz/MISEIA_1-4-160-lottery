# PERT Compliance Plan — LoteriApp (1-4-160-lottery)

**Fecha:** 2026-06-27  
**Proyecto:** LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe

---

## PERT Compliance Plan

Plan lógico de tareas para llevar el proyecto a cumplimiento total. Las dependencias reflejan el orden mínimo necesario para evitar retrabajo.

```
[001] env_example
      └──> [002] tests_minimos
                └──> [008] cobertura_tests
      └──> [004] dockerfile_deploy
                └──> [005] cicd_github  ──> [007] deploy_publico
                └──> [006] cicd_gitlab
[003] diagrama_arquitectura (independiente)
[009] cambios_ia (independiente)
[010] adrs_decision_log (independiente)
[011] justificacion_cuantitativa (independiente)
```

### Nodos y Dependencias

| ID | Tarea | Depende de | Prompt File |
|---|---|---|---|
| 001 | Crear `.env.example` (fix `cq_sin_secretos_en_repo` + `dc_env_example`) | — | `[001]_env_example_fn_prompt.md` |
| 002 | Implementar tests mínimos ejecutables (fix `cq_tests_minimos`) | 001 | `[002]_tests_minimos_fn_prompt.md` |
| 003 | Crear diagrama de arquitectura (fix `dc_diagrama_arquitectura`) | — | `[003]_diagrama_arquitectura_fn_prompt.md` |
| 004 | Crear Dockerfile + instrucciones deploy (fix `dc_instrucciones_deploy`) | 001 | `[004]_dockerfile_deploy_fn_prompt.md` |
| 005 | Pipeline CI/CD GitHub Actions (fix `cq_ci_funcional`) | 001, 002, 004 | `[005]_cicd_github_fn_prompt.md` |
| 006 | Pipeline CI/CD GitLab (fix `cq_ci_funcional`) | 001, 002, 004 | `[006]_cicd_gitlab_fn_prompt.md` |
| 007 | Deploy público accesible en VM (fix `fn_deploy_publico_accesible`) | 004, 005 | `[007]_deploy_publico_fn_prompt.md` |
| 008 | Reporte de cobertura de tests (fix `cq_cobertura_alta`) | 002 | `[008]_cobertura_tests_fn_prompt.md` |
| 009 | Documentar cambios respecto a IA (fix `dc_cambios_ia_documentados`) | — | `[009]_cambios_ia_fn_prompt.md` |
| 010 | ADRs / Decision Log (fix `dc_adrs_o_decision_log`) | — | `[010]_adrs_decision_log_fn_prompt.md` |
| 011 | Justificación cuantitativa (fix `dc_justificacion_cuantitativa`) | — | `[011]_justificacion_cuantitativa_fn_prompt.md` |

---

## Execution PERT

Orden de ejecución serializado según dependencias del grafo PERT (ruta crítica primero: 001 → 002 → 004 → 005 → 007):

| # | Tarea | ID | Prompt File | Dependencias | Duración Est. |
|---|---|---|---|---|---|
| 1 | Crear `.env.example` con todas las variables | 001 | `[001]_env_example_fn_prompt.md` | — | 0.5 h |
| 2 | Crear diagrama de arquitectura Mermaid | 003 | `[003]_diagrama_arquitectura_fn_prompt.md` | — | 1 h |
| 3 | Documentar cambios respecto a IA en README | 009 | `[009]_cambios_ia_fn_prompt.md` | — | 0.5 h |
| 4 | Crear ADRs / Decision Log | 010 | `[010]_adrs_decision_log_fn_prompt.md` | — | 1 h |
| 5 | Justificación cuantitativa de decisiones | 011 | `[011]_justificacion_cuantitativa_fn_prompt.md` | — | 1 h |
| 6 | Implementar tests mínimos (Jest + `test` script) | 002 | `[002]_tests_minimos_fn_prompt.md` | 001 | 3 h |
| 7 | Crear Dockerfile + `env.production` + compose | 004 | `[004]_dockerfile_deploy_fn_prompt.md` | 001 | 2 h |
| 8 | Configurar cobertura de tests (>60%) | 008 | `[008]_cobertura_tests_fn_prompt.md` | 002 | 2 h |
| 9 | Pipeline CI/CD GitHub Actions | 005 | `[005]_cicd_github_fn_prompt.md` | 001, 002, 004 | 2 h |
| 10 | Pipeline CI/CD GitLab | 006 | `[006]_cicd_gitlab_fn_prompt.md` | 001, 002, 004 | 1.5 h |
| 11 | Deploy público en GCI VM (Traefik + Docker) | 007 | `[007]_deploy_publico_fn_prompt.md` | 004, 005 | 1 h |
